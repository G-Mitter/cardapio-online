'use server'

/**
 * Tudo o que o painel da loja grava. Cada ação começa por `sessao(permissão)`, que confere o login, a permissão
 * e a loja; as gravações vão como o usuário logado, e o Payload confere o acesso de novo.
 */
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getPayload, type Payload } from 'payload'

import { COOKIE_LOJA, iniciarSessao, sessao, sessaoGarcom } from '@/lib/painel'
import { STATUS, type Status } from '@/lib/pedidosDoDia'
import { fimDoDia, normalizarCodigo } from '@/lib/cupom'
import { lerBairros, taxaDoBairro } from '@/lib/entrega'
import { loginDoGarcom } from '@/lib/garcom'
import { montarEndereco, montarHorario } from '@/lib/lojaTexto'
import { calcularAcerto, diferencaDoAcerto, hojeEmBrasilia, intervaloDoDia, type Parada } from '@/lib/entregadores'
import { whatsappUrl } from '@/lib/whatsapp'
import { CATEGORIAS, intervaloDoMes, lerData, proximoVencimento, somarDias, type Tipo, TIPOS } from '@/lib/financeiro'
import { conferir, lerRelatorio, type PagamentoLoja, recebimentosPorData, TOLERANCIA_MIN } from '@/lib/maquininha'
import { fecharPagamento, lerTaxaServico, type Recebido, totalDaConta } from '@/lib/conta'
import { lerMesas } from '@/lib/mesas'
import { lerPixelMeta, lerTagGoogle } from '@/lib/pixel'
import { gruposDoProduto, lerOpcoesDaTela } from '@/lib/opcoes'
import { promocaoDoProduto } from '@/lib/promocao'
import { contido, efetivas, gerentes, lerPermissoes, SEM_EXCLUIR, temPermissao } from '@/lib/permissoes'
import { lerSelos } from '@/lib/selos'
import { FORMAS_PAGAMENTO, type FormaPagamento, type ItemEscolhido, mensagemPedido, montarPedido } from '@/lib/pedido'
import { rotuloAgendamento } from '@/lib/agendamento'
import { normalizarTelefone } from '@/lib/cliente'
import { comCidade, linkMaps, MAX_PARADAS } from '@/lib/rota'
import { lerPreco } from '@/lib/planilha'
import { lerSetor } from '@/lib/setores'
import { ORIGENS } from '@/lib/origem'
import { lerLargura, lerVias } from '@/lib/ticket'
import { sql } from '@payloadcms/db-postgres'
import { lerFicha, lerQuantidade, lerUnidade, somar } from '@/lib/estoque'
import { pausarPelaFicha, refazerPausa } from '@/lib/estoque-db'
import { mover } from '@/lib/ordem'
import { lerItensCompra, totalDaCompra } from '@/lib/compras'
import { diferenca, dinheiroEsperado, lerMovimento } from '@/lib/caixa'
import { vendasDoPeriodo } from '@/lib/caixa-db'
import type { Loja } from '@/payload-types'
import config from '@/payload.config'

/** Resposta das ações com formulário: uma mensagem de erro para mostrar, ou nada. */
export type Estado = { erro: string } | null

const texto = (form: FormData, campo: string) => String(form.get(campo) ?? '').trim()
const marcado = (form: FormData, campo: string) => form.get(campo) === 'on'

/** Mensagem do Payload ("The following field is invalid: ...") vira algo legível. */
function mensagem(e: unknown): string {
  const dados = (e as { data?: { errors?: { message?: string }[] } })?.data?.errors
  return dados?.map((d) => d.message).filter(Boolean).join(' ') || 'Não foi possível salvar. Tente de novo.'
}

const tokenCookie = (payload: Payload) => `${payload.config.cookiePrefix}-token`

// ---------- Entrar e sair ----------

export async function entrar(_: Estado, form: FormData): Promise<Estado> {
  const payload = await getPayload({ config })
  const login = texto(form, 'login').toLowerCase()
  let resultado
  try {
    resultado = await payload.login({
      collection: 'users',
      // Com @ é e-mail (dono); sem @ é o usuário do garçom.
      data: { ...(login.includes('@') ? { email: login } : { username: login }), password: String(form.get('senha') ?? '') },
    })
  } catch {
    return { erro: 'Usuário ou senha incorretos.' }
  }
  if (resultado.user?.ativo === false) return { erro: 'Este acesso está desligado. Fale com a loja.' }
  await iniciarSessao(payload, resultado)
  redirect('/painel')
}

export async function sair() {
  const payload = await getPayload({ config })
  const jar = await cookies()
  jar.delete(tokenCookie(payload))
  jar.delete(COOKIE_LOJA)
  redirect('/painel/entrar')
}

/** Para quem cuida de mais de uma loja: escolhe com qual trabalhar. */
export async function trocarLoja(form: FormData) {
  const { lojas } = await sessao(null)
  const id = Number(form.get('loja'))
  if (lojas.some((l) => l.id === id)) {
    ;(await cookies()).set(COOKIE_LOJA, String(id), { httpOnly: true, sameSite: 'lax', path: '/' })
  }
  redirect('/painel')
}

// ---------- Pedidos ----------

export async function mudarStatus(
  id: number,
  status: Status,
  /** Retirada com código: só vira Entregue se a loja digitar o código que o cliente mostrou. */
  codigo?: string,
): Promise<{ ok: boolean; erro?: string }> {
  if (!STATUS.includes(status)) return { ok: false }
  const { payload, loja, comoUsuario } = await sessao('pedidos')
  try {
    if (status === 'entregue') {
      const { docs } = await payload.find({
        collection: 'pedidos',
        where: { id: { equals: id }, loja: { equals: loja.id } },
        limit: 1,
        depth: 0,
        ...comoUsuario,
      })
      const p = docs[0]
      if (p?.modo === 'retirada' && p.codigoRetirada && p.codigoRetirada !== codigo?.trim()) {
        return { ok: false, erro: 'Código não confere. Peça para o cliente mostrar de novo.' }
      }
    }
    // where com a loja: mesmo o administrador só mexe nos pedidos da loja aberta no painel.
    const r = await payload.update({
      collection: 'pedidos',
      where: { id: { equals: id }, loja: { equals: loja.id } },
      data: { status },
      ...comoUsuario,
    })
    return { ok: r.docs.length === 1 }
  } catch {
    return { ok: false }
  }
}

/**
 * Troca os itens de um pedido que ainda não foi entregue (o cliente pediu para acrescentar algo).
 * Preço e total saem do banco; entrega e cupom continuam como estavam. Devolve o link do WhatsApp
 * do cliente com o pedido atualizado, para a loja reenviar.
 */
export async function editarPedido(
  id: number,
  itens: ItemEscolhido[],
  observacoes: string,
): Promise<{ ok: true; whatsapp: string | null } | { ok: false; erro: string }> {
  const { payload, loja, comoUsuario } = await sessao('pedidos')
  const { docs } = await payload.find({
    collection: 'pedidos',
    where: { id: { equals: id }, loja: { equals: loja.id } },
    limit: 1,
    depth: 0,
    ...comoUsuario,
  })
  const p = docs[0]
  if (!p || p.mesa) return { ok: false, erro: 'Pedido não encontrado.' }
  if (p.status === 'entregue' || p.status === 'cancelado') return { ok: false, erro: 'Este pedido já foi encerrado.' }

  const escolhidos = Array.isArray(itens) ? itens.slice(0, 100) : []
  const produtos = await payload.find({
    collection: 'produtos',
    where: { loja: { equals: loja.id }, id: { in: escolhidos.map((i) => i.produto) } },
    limit: 100,
    depth: 0,
    ...comoUsuario,
  })
  // Item que já estava no pedido não trava a edição se o produto esgotou depois.
  const jaNoPedido = new Set(p.itens.map((i) => i.produto))
  const r = montarPedido(
    produtos.docs.map((x) => ({ ...x, opcoes: gruposDoProduto(x.opcoes), esgotado: x.esgotado && !jaNoPedido.has(x.id) })),
    escolhidos,
    p.taxa,
    p.modo,
  )
  if (!r.ok) return r
  const { pedido } = r
  // ponytail: o cupom vira um valor fixo (limitado ao que sobra); recalcular pela regra do cupom se precisar.
  const desconto = Math.min(p.desconto ?? 0, Math.max(0, pedido.subtotal - pedido.promocao))
  const total = Math.round((pedido.subtotal + pedido.taxa - pedido.promocao - desconto) * 100) / 100
  const obs = String(observacoes ?? '').trim().slice(0, 300)
  try {
    await payload.update({
      collection: 'pedidos',
      id,
      overrideAccess: true,
      data: {
        itens: pedido.itens.map(({ produto, nome, quantidade, precoUnitario, opcoes, escolhas }) => ({
          produto: Number(produto),
          nome,
          quantidade,
          precoUnitario,
          opcoes,
          escolhas,
        })),
        subtotal: pedido.subtotal,
        promocao: pedido.promocao,
        desconto,
        total,
        observacoes: obs,
      },
    })
  } catch {
    return { ok: false, erro: 'Não foi possível salvar. Tente de novo.' }
  }

  const texto = mensagemPedido({
    loja: loja.nome,
    numero: p.numero,
    pedido: { ...pedido, desconto, cupom: p.cupom ?? undefined, total },
    modo: p.modo,
    nome: p.nome,
    endereco: p.endereco ?? undefined,
    observacoes: obs,
    pagamento: p.pagamento ?? undefined,
    trocoPara: p.trocoPara,
    cpf: p.cpf,
    codigoRetirada: p.codigoRetirada ?? undefined,
    agendadoPara: p.agendadoPara ? rotuloAgendamento(p.agendadoPara) : undefined,
  })
  return { ok: true, whatsapp: p.telefone ? whatsappUrl(p.telefone, `Seu pedido foi atualizado:\n\n${texto}`) : null }
}

export type DadosPedidoPainel = {
  /** Balcão: retira na hora. Retirada e entrega: pedido feito por telefone. */
  tipo: 'balcao' | 'retirada' | 'entrega'
  itens: ItemEscolhido[]
  /** Opcionais; sem nome o pedido fica "Balcão" ou "Cliente". */
  nome: string
  telefone: string
  /** Só na entrega. */
  endereco: string
  bairro: string
  pagamento: FormaPagamento
  trocoPara: string
  observacoes: string
}

/**
 * Pedido lançado pela loja (balcão ou telefone). Mesma conta do site: preço, taxa e total
 * saem do banco, nunca do que o navegador mandou. Sem cupom, agendamento ou CPF.
 */
export async function criarPedidoPainel(
  dados: DadosPedidoPainel,
): Promise<{ ok: true; numero: number } | { ok: false; erro: string }> {
  const { payload, loja, comoUsuario } = await sessao('pedidos')
  const tipo = dados.tipo
  if (tipo !== 'balcao' && tipo !== 'retirada' && tipo !== 'entrega') return { ok: false, erro: 'Escolha o tipo do pedido.' }
  const modo = tipo === 'entrega' ? 'entrega' : 'retirada'
  const itens = Array.isArray(dados.itens) ? dados.itens.slice(0, 100) : []

  const telefoneDigitado = String(dados.telefone ?? '').trim()
  const telefone = normalizarTelefone(telefoneDigitado)
  if (telefoneDigitado && !telefone) return { ok: false, erro: 'Telefone incompleto. Use DDD e número, ou deixe em branco.' }
  if (modo === 'entrega' && loja.fazEntrega === false) return { ok: false, erro: 'Esta loja não faz entrega.' }
  if (tipo === 'retirada' && loja.aceitaRetirada === false) return { ok: false, erro: 'Esta loja não aceita retirada.' }
  if (!loja.formasPagamento?.includes(dados.pagamento)) return { ok: false, erro: 'Escolha a forma de pagamento.' }

  const endereco = String(dados.endereco ?? '').trim().slice(0, 200)
  const bairro = String(dados.bairro ?? '').trim().slice(0, 100)
  let taxa = 0
  if (modo === 'entrega') {
    if (!endereco) return { ok: false, erro: 'Coloque o endereço da entrega.' }
    const t = taxaDoBairro(loja.bairros, bairro, loja.taxaEntrega ?? 0)
    if (t === null) return { ok: false, erro: 'Escolha um bairro em que a loja entrega.' }
    taxa = t
  }

  const produtos = await payload.find({
    collection: 'produtos',
    where: { loja: { equals: loja.id }, id: { in: itens.map((i) => i.produto) } },
    limit: 100,
    depth: 0,
    ...comoUsuario,
  })
  const r = montarPedido(produtos.docs.map((p) => ({ ...p, opcoes: gruposDoProduto(p.opcoes) })), itens, taxa, modo)
  if (!r.ok) return r
  const { pedido } = r

  const trocoDigitado = dados.pagamento === 'dinheiro' ? String(dados.trocoPara ?? '').trim().slice(0, 20) : ''
  const trocoPara = trocoDigitado ? lerPreco(trocoDigitado) : null
  if (trocoDigitado && (trocoPara === null || trocoPara < pedido.total)) {
    return { ok: false, erro: 'O troco precisa ser para um valor maior que o total.' }
  }

  // ponytail: mesmo número do site (total de pedidos + 1), com a mesma chance de repetir em pedidos no mesmo instante.
  const total = await payload.count({ collection: 'pedidos', where: { loja: { equals: loja.id } }, overrideAccess: true })
  const numero = total.totalDocs + 1
  try {
    await payload.create({
      collection: 'pedidos',
      overrideAccess: true,
      data: {
        loja: loja.id,
        numero,
        status: 'novo',
        itens: pedido.itens.map(({ produto, nome, quantidade, precoUnitario, opcoes, escolhas }) => ({
          produto: Number(produto),
          nome,
          quantidade,
          precoUnitario,
          opcoes,
          escolhas,
        })),
        subtotal: pedido.subtotal,
        taxa: pedido.taxa,
        promocao: pedido.promocao,
        desconto: pedido.desconto,
        total: pedido.total,
        modo,
        balcao: tipo === 'balcao',
        nome: String(dados.nome ?? '').trim().slice(0, 100) || (tipo === 'balcao' ? 'Balcão' : 'Cliente'),
        telefone,
        endereco: modo === 'entrega' ? [endereco, bairro].filter(Boolean).join(', ') : '',
        observacoes: String(dados.observacoes ?? '').trim().slice(0, 300),
        pagamento: dados.pagamento,
        trocoPara,
      },
    })
  } catch {
    return { ok: false, erro: 'Não foi possível salvar. Tente de novo.' }
  }
  return { ok: true, numero }
}

/**
 * Pedido da mesa lançado pelo garçom (ou pelo dono). Mesma conta do site: preço e total saem do banco.
 * Sem taxa, sem cupom e pago no caixa, como o pedido que o cliente faz pelo QR Code.
 */
export async function criarPedidoDaMesa(
  mesa: string,
  itens: ItemEscolhido[],
  observacoes: string,
): Promise<{ ok: true; numero: number } | { ok: false; erro: string }> {
  const { payload, loja, user, garcom, comoUsuario } = await sessaoGarcom('pedidos')
  const mesas = lerMesas(loja.mesas ?? '')
  if (!mesas.ok || !mesas.mesas.includes(mesa)) return { ok: false, erro: 'Mesa não encontrada.' }
  const lista = Array.isArray(itens) ? itens.slice(0, 100) : []

  const produtos = await payload.find({
    collection: 'produtos',
    where: { loja: { equals: loja.id }, id: { in: lista.map((i) => i.produto) } },
    limit: 100,
    depth: 0,
    ...comoUsuario,
  })
  const r = montarPedido(produtos.docs.map((p) => ({ ...p, opcoes: gruposDoProduto(p.opcoes) })), lista, 0, 'retirada')
  if (!r.ok) return r
  const { pedido } = r

  // ponytail: mesmo número do site (total de pedidos + 1), com a mesma chance de repetir em pedidos no mesmo instante.
  const total = await payload.count({ collection: 'pedidos', where: { loja: { equals: loja.id } }, overrideAccess: true })
  const numero = total.totalDocs + 1
  try {
    await payload.create({
      collection: 'pedidos',
      overrideAccess: true,
      data: {
        loja: loja.id,
        numero,
        status: 'novo',
        itens: pedido.itens.map(({ produto, nome, quantidade, precoUnitario, opcoes, escolhas }) => ({
          produto: Number(produto),
          nome,
          quantidade,
          precoUnitario,
          opcoes,
          escolhas,
        })),
        subtotal: pedido.subtotal,
        taxa: 0,
        promocao: pedido.promocao,
        desconto: 0,
        total: pedido.total,
        modo: 'retirada',
        mesa,
        nome: `Mesa ${mesa}`,
        observacoes: String(observacoes ?? '').trim().slice(0, 300),
        ...(garcom ? { garcom: user.id } : {}),
      },
    })
  } catch {
    return { ok: false, erro: 'Não foi possível salvar. Tente de novo.' }
  }
  return { ok: true, numero }
}

/**
 * Fecha a conta da mesa e registra como ela pagou. Os valores saem dos pedidos no banco, não do
 * navegador. Só os pedidos que entraram na conta fecham: pedido novo no meio do caminho fica aberto.
 */
export async function fecharContaDaMesa(
  mesa: string,
  cobrarTaxa: boolean,
  recebido: Recebido[],
): Promise<{ ok: true; troco: number } | { ok: false; erro: string }> {
  const { payload, loja, user, garcom: ehGarcom, comoUsuario } = await sessaoGarcom('pedidos')
  const { docs } = await payload.find({
    collection: 'pedidos',
    where: {
      loja: { equals: loja.id },
      mesa: { equals: String(mesa) },
      contaFechada: { not_equals: true },
      status: { not_equals: 'cancelado' },
    },
    sort: 'createdAt',
    limit: 200,
    depth: 0,
    ...comoUsuario,
  })
  if (!docs.length) return { ok: false, erro: 'Esta mesa não tem conta aberta.' }

  const subtotal = docs.reduce((s, p) => s + Math.round(p.total * 100), 0) / 100
  const { taxaServico, total } = totalDaConta(subtotal, loja.taxaServico ?? 0, cobrarTaxa === true)
  const formas = (Array.isArray(recebido) ? recebido : []).filter((r) => loja.formasPagamento?.includes(r.forma))
  const pago = fecharPagamento(total, formas)
  if (!pago.ok) return pago

  const garcomDaConta =
    (ehGarcom ? user.id : null) ?? docs.map((p) => (typeof p.garcom === 'object' ? p.garcom?.id : p.garcom)).find(Boolean)
  try {
    await payload.create({
      collection: 'fechamentos',
      overrideAccess: true,
      data: {
        loja: loja.id,
        mesa: String(mesa),
        pedidos: docs.map((p) => p.id),
        subtotal,
        taxaServico,
        total,
        pagamentos: pago.pagamentos,
        troco: pago.troco,
        garcom: garcomDaConta ?? undefined,
        fechadoPor: user.id,
      },
    })
    await payload.update({
      collection: 'pedidos',
      where: { loja: { equals: loja.id }, id: { in: docs.map((p) => p.id) } },
      data: { contaFechada: true },
      overrideAccess: true,
    })
  } catch {
    return { ok: false, erro: 'Não foi possível fechar a conta. Tente de novo.' }
  }
  return { ok: true, troco: pago.troco }
}

// ---------- Rota de entrega ----------

/**
 * Chave do Google Maps usada por esta loja. Hoje todas usam a do sistema (variável
 * GOOGLE_MAPS_KEY na Vercel); para uma loja usar a própria, basta devolver a dela aqui.
 */
function chaveGoogle(_loja: Loja): string | undefined {
  return process.env.GOOGLE_MAPS_KEY || undefined
}

/**
 * Pede ao Google a melhor ordem das paradas (Routes API, optimizeWaypointOrder).
 * Devolve os índices das paradas na nova ordem, ou null se o Google não respondeu.
 */
async function ordemGoogle(chave: string, loja: string, paradas: string[]) {
  try {
    const r = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': chave,
        'X-Goog-FieldMask': 'routes.optimizedIntermediateWaypointIndex',
      },
      body: JSON.stringify({
        origin: { address: loja },
        destination: { address: loja },
        intermediates: paradas.map((address) => ({ address })),
        travelMode: 'DRIVE',
        optimizeWaypointOrder: true,
      }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!r.ok) return null
    const ordem: unknown = (await r.json())?.routes?.[0]?.optimizedIntermediateWaypointIndex
    // Com uma parada só o Google não manda a ordem: não tem o que trocar.
    if (paradas.length === 1) return [0]
    return Array.isArray(ordem) && ordem.length === paradas.length ? (ordem as number[]) : null
  } catch {
    return null
  }
}

export type Rota =
  | { ok: true; link: string; numeros: number[]; paradas: Parada[]; otimizada: boolean }
  | { ok: false; erro: string }

/** Monta a rota do entregador com os pedidos de entrega escolhidos no painel. */
export async function montarRota(ids: number[]): Promise<Rota> {
  const { payload, loja, comoUsuario } = await sessao('pedidos')
  const enderecoLoja = loja.endereco?.trim()
  if (!enderecoLoja)
    return { ok: false, erro: 'Coloque o endereço da loja em "Dados da loja" para montar a rota.' }
  if (!ids.length) return { ok: false, erro: 'Escolha os pedidos que vão na rota.' }
  if (ids.length > MAX_PARADAS) {
    return {
      ok: false,
      erro: `O Google Maps aceita até ${MAX_PARADAS} paradas por rota. Divida em duas rotas.`,
    }
  }

  const { docs } = await payload.find({
    collection: 'pedidos',
    where: { id: { in: ids }, loja: { equals: loja.id }, modo: { equals: 'entrega' } },
    depth: 0,
    limit: MAX_PARADAS,
    sort: 'numero',
    ...comoUsuario,
  })
  const pedidos = docs.filter((p) => p.endereco)
  if (!pedidos.length) return { ok: false, erro: 'Nenhum dos pedidos escolhidos tem endereço.' }

  const paradas = pedidos.map((p) => comCidade(p.endereco!, enderecoLoja))
  const chave = chaveGoogle(loja)
  const ordem = chave ? await ordemGoogle(chave, enderecoLoja, paradas) : null
  // Sem chave ou sem resposta do Google, a rota segue a ordem dos pedidos.
  const indices = ordem ?? paradas.map((_, i) => i)
  return {
    ok: true,
    link: linkMaps(
      enderecoLoja,
      indices.map((i) => paradas[i]),
    ),
    numeros: indices.map((i) => pedidos[i].numero),
    paradas: indices.map((i) => ({
      numero: pedidos[i].numero,
      nome: pedidos[i].nome,
      telefone: pedidos[i].telefone ?? '',
      endereco: pedidos[i].endereco!,
    })),
    otimizada: Boolean(ordem),
  }
}

// ---------- Entregadores ----------

export async function salvarEntregador(_: Estado, form: FormData): Promise<Estado> {
  const { payload, loja, comoUsuario } = await sessao('equipe')
  const nome = texto(form, 'nome').slice(0, 80)
  const whatsapp = texto(form, 'whatsapp')
  if (!nome) return { erro: 'Coloque o nome do entregador.' }
  if (!whatsappUrl(whatsapp)) return { erro: 'WhatsApp incompleto. Use DDD e número, por exemplo (31) 99999-0000.' }
  try {
    await payload.create({
      collection: 'entregadores',
      data: { loja: loja.id, nome, whatsapp, ativo: true },
      ...comoUsuario,
    })
  } catch (e) {
    return { erro: mensagem(e) }
  }
  redirect('/painel/entregadores')
}

export async function ligarEntregador(id: number, ativo: boolean) {
  const { payload, loja, comoUsuario } = await sessao('equipe')
  await payload.update({
    collection: 'entregadores',
    where: { id: { equals: id }, loja: { equals: loja.id } },
    data: { ativo },
    ...comoUsuario,
  })
  redirect('/painel/entregadores')
}

/** Pedidos entregues pelo entregador no dia que ainda não entraram em nenhum acerto. */
async function pendentesDoAcerto(entregador: number, dia: string) {
  const { payload, loja, comoUsuario } = await sessao('equipe')
  const { dia: diaValido, de, ate } = intervaloDoDia(dia)
  const [entregues, feitos] = await Promise.all([
    payload.find({
      collection: 'pedidos',
      where: {
        loja: { equals: loja.id },
        modo: { equals: 'entrega' },
        status: { equals: 'entregue' },
        entregador: { equals: entregador },
        createdAt: { greater_than_equal: de, less_than: ate },
      },
      limit: 0,
      depth: 0,
      ...comoUsuario,
    }),
    payload.find({
      collection: 'acertos',
      where: { loja: { equals: loja.id }, entregador: { equals: entregador }, dia: { equals: diaValido } },
      limit: 0,
      depth: 0,
      ...comoUsuario,
    }),
  ])
  const jaFeitos = new Set(feitos.docs.flatMap((a) => (a.pedidos ?? []).map((p) => (typeof p === 'number' ? p : p.id))))
  return { payload, loja, user: comoUsuario.user, comoUsuario, dia: diaValido, pedidos: entregues.docs.filter((p) => !jaFeitos.has(p.id)) }
}

/**
 * "Acerto feito": guarda o que o entregador devia trazer, o que trouxe e a diferença. Os valores
 * esperados saem dos pedidos no banco; do navegador vêm só o troco, o que ele entregou e a taxa descontada.
 */
export async function fazerAcerto(
  entregador: number,
  dia: string,
  troco: string,
  entregue: string,
  descontouTaxa: boolean,
): Promise<{ ok: true } | { ok: false; erro: string }> {
  const trocoR = lerPreco(String(troco ?? '').trim() || '0')
  const entregueR = lerPreco(String(entregue ?? '').trim())
  if (trocoR === null) return { ok: false, erro: 'Troco inválido. Use, por exemplo, 50,00.' }
  if (entregueR === null) return { ok: false, erro: 'Coloque quanto o entregador entregou, por exemplo 125,50 (ou 0).' }
  const { payload, loja, user, dia: diaValido, pedidos } = await pendentesDoAcerto(Number(entregador), dia)
  if (!pedidos.length) return { ok: false, erro: 'Não há entregas para acertar neste dia.' }
  const c = calcularAcerto(pedidos, trocoR, descontouTaxa === true)
  const d = diferencaDoAcerto(entregueR, c.esperado)
  try {
    await payload.create({
      collection: 'acertos',
      overrideAccess: true,
      data: {
        loja: loja.id,
        entregador: Number(entregador),
        dia: diaValido,
        pedidos: pedidos.map((p) => p.id),
        dinheiro: c.dinheiro,
        cartao: c.cartao,
        pix: c.pix,
        troco: trocoR,
        taxas: c.taxas,
        descontouTaxa: descontouTaxa === true,
        esperado: c.esperado,
        entregue: entregueR,
        diferenca: d.valor,
        conferidoPor: user.id,
      },
    })
  } catch {
    return { ok: false, erro: 'Não foi possível guardar o acerto. Tente de novo.' }
  }
  return { ok: true }
}

/** Troca a forma de pagamento de um pedido entregue (o cliente pagou diferente), antes do acerto. */
export async function mudarPagamentoDoPedido(id: number, form: FormData) {
  const { payload, loja, comoUsuario } = await sessao('pedidos')
  const forma = texto(form, 'forma') as FormaPagamento
  // O dia vem escondido no formulário para a tela continuar no dia que o dono estava vendo.
  const voltar = `/painel/entregadores?dia=${intervaloDoDia(texto(form, 'dia')).dia}`
  if (!loja.formasPagamento?.includes(forma)) redirect(voltar)
  const feito = await payload.count({
    collection: 'acertos',
    where: { loja: { equals: loja.id }, pedidos: { contains: id } },
    overrideAccess: true,
  })
  if (feito.totalDocs === 0) {
    await payload.update({
      collection: 'pedidos',
      where: { id: { equals: id }, loja: { equals: loja.id }, status: { equals: 'entregue' } },
      data: { pagamento: forma, ...(forma !== 'dinheiro' && { trocoPara: null }) },
      ...comoUsuario,
    })
  }
  redirect(voltar)
}

/** Põe o entregador (ou tira, com null) nos pedidos de entrega escolhidos. */
export async function atribuirEntregador(ids: number[], entregador: number | null): Promise<{ ok: boolean }> {
  const { payload, loja, comoUsuario } = await sessao('pedidos')
  try {
    if (entregador !== null) {
      // Só entregador desta loja.
      const { totalDocs } = await payload.count({
        collection: 'entregadores',
        where: { id: { equals: entregador }, loja: { equals: loja.id } },
        ...comoUsuario,
      })
      if (!totalDocs) return { ok: false }
    }
    await payload.update({
      collection: 'pedidos',
      where: { id: { in: ids }, loja: { equals: loja.id }, modo: { equals: 'entrega' } },
      data: { entregador },
      ...comoUsuario,
    })
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

// ---------- Imagens ----------

/**
 * Sobe a imagem do formulário (já reduzida no navegador) e devolve o id dela.
 * Sem arquivo, devolve undefined (não mexe na imagem atual).
 */
async function subirImagem(form: FormData, campo: string, alt: string) {
  const arquivo = form.get(campo)
  if (!(arquivo instanceof File) || arquivo.size === 0) return undefined
  if (!arquivo.type.startsWith('image/')) throw new Error('O arquivo precisa ser uma imagem.')
  const { payload, loja, comoUsuario } = await sessao(null)
  const media = await payload.create({
    collection: 'media',
    data: { alt, loja: loja.id },
    file: {
      data: Buffer.from(await arquivo.arrayBuffer()),
      mimetype: arquivo.type,
      name: arquivo.name,
      size: arquivo.size,
    },
    ...comoUsuario,
  })
  return media.id
}

/** Imagem nova, imagem removida (null) ou sem mudança (undefined). */
async function imagem(form: FormData, campo: string, alt: string) {
  if (marcado(form, `${campo}-remover`)) return null
  return subirImagem(form, campo, alt)
}

// ---------- Produtos ----------

export async function salvarProduto(id: number | null, _: Estado, form: FormData): Promise<Estado> {
  const { payload, loja, comoUsuario } = await sessao('cardapio')
  const nome = texto(form, 'nome')
  const preco = lerPreco(texto(form, 'preco'))
  if (!nome) return { erro: 'Coloque o nome do produto.' }
  if (preco === null) return { erro: 'Preço inválido. Use, por exemplo, 32,90.' }
  const leve = Number(texto(form, 'leve')) || null
  const pague = Number(texto(form, 'pague')) || null
  if ((leve || pague) && !promocaoDoProduto({ leve, pague })) {
    return { erro: 'Na promoção, preencha "leve" (2 ou mais) e "pague" (um número menor que o "leve"), ou deixe os dois vazios.' }
  }
  const opcoes = lerOpcoesDaTela(texto(form, 'opcoes'))
  if (!opcoes.ok) return { erro: opcoes.erro }
  const doEstoque = await payload.find({ collection: 'ingredientes', where: { loja: { equals: loja.id } }, limit: 0, depth: 0, select: {}, ...comoUsuario })
  const ficha = lerFicha(texto(form, 'ficha'), doEstoque.docs.map((i) => i.id))
  if (!ficha.ok) return { erro: ficha.erro }

  // A categoria precisa ser desta loja.
  const categoria = Number(form.get('categoria'))
  const { totalDocs } = await payload.count({
    collection: 'categorias',
    where: { id: { equals: categoria }, loja: { equals: loja.id } },
  })
  if (!totalDocs) return { erro: 'Escolha uma categoria.' }

  try {
    const foto = await imagem(form, 'foto', nome)
    const data = {
      nome,
      descricao: texto(form, 'descricao'),
      preco,
      categoria,
      esgotado: marcado(form, 'esgotado'),
      modoPreparo: texto(form, 'modoPreparo').slice(0, 2000),
      naEmbalagem: texto(form, 'naEmbalagem').slice(0, 500),
      ficha: ficha.ficha,
      opcoes: opcoes.grupos,
      leve,
      pague,
      selos: lerSelos(form.getAll('selos')),
      ...(foto !== undefined && { foto }),
    }
    // Produto novo (ou que mudou de categoria) entra no fim da categoria.
    const fimDaCategoria = () =>
      payload
        .count({ collection: 'produtos', where: { categoria: { equals: categoria }, loja: { equals: loja.id } } })
        .then((c) => c.totalDocs)
    let salvo: { id: number; esgotado?: boolean | null; esgotadoAuto?: boolean | null; ficha?: { ingrediente: unknown; quantidade: number }[] | null }
    if (id === null) {
      salvo = await payload.create({
        collection: 'produtos',
        data: { ...data, ordem: await fimDaCategoria(), loja: loja.id },
        ...comoUsuario,
      })
    } else {
      const atual = await payload.find({
        collection: 'produtos',
        where: { id: { equals: id }, loja: { equals: loja.id } },
        limit: 1,
        depth: 0,
        ...comoUsuario,
      })
      const antes = atual.docs[0]
      if (!antes) return { erro: 'Produto não encontrado.' }
      const trocouDeCategoria = (typeof antes.categoria === 'object' ? antes.categoria.id : antes.categoria) !== categoria
      // Mexer no "esgotado" à mão tira a marca da pausa automática; salvar sem mexer mantém.
      const esgotadoAuto = Boolean(antes.esgotadoAuto) && data.esgotado === Boolean(antes.esgotado)
      salvo = await payload.update({
        collection: 'produtos',
        id,
        data: { ...(trocouDeCategoria ? { ...data, ordem: await fimDaCategoria() } : data), esgotadoAuto },
        ...comoUsuario,
      })
    }
    // Ficha nova pode pausar o prato (já falta ingrediente) ou liberar o que estava pausado.
    await pausarPelaFicha(payload, loja.id, [salvo])
  } catch (e) {
    return { erro: e instanceof Error && !('data' in e) ? e.message : mensagem(e) }
  }
  redirect('/painel/produtos')
}

export async function apagarProduto(id: number): Promise<Estado> {
  const { payload, loja, user, comoUsuario } = await sessao('cardapio')
  if (!temPermissao(user, 'excluir')) return SEM_EXCLUIR
  await payload.delete({
    collection: 'produtos',
    where: { id: { equals: id }, loja: { equals: loja.id } },
    ...comoUsuario,
  })
  return null
}

export async function marcarEsgotado(id: number, esgotado: boolean) {
  const { payload, loja, comoUsuario } = await sessao('cardapio')
  await payload.update({
    collection: 'produtos',
    where: { id: { equals: id }, loja: { equals: loja.id } },
    data: { esgotado, esgotadoAuto: false },
    ...comoUsuario,
  })
  redirect('/painel/produtos')
}

/**
 * Sobe (-1) ou desce (1) um produto dentro da categoria. A categoria é renumerada (0, 1, 2...)
 * a cada troca, então empates antigos não atrapalham.
 */
export async function moverProduto(id: number, direcao: -1 | 1) {
  const { payload, loja, comoUsuario } = await sessao('cardapio')
  const produto = await payload.find({
    collection: 'produtos',
    where: { id: { equals: id }, loja: { equals: loja.id } },
    limit: 1,
    depth: 0,
    ...comoUsuario,
  })
  const categoria = produto.docs[0]?.categoria
  if (categoria) {
    const irmaos = await payload.find({
      collection: 'produtos',
      where: { categoria: { equals: typeof categoria === 'object' ? categoria.id : categoria }, loja: { equals: loja.id } },
      sort: ['ordem', 'id'],
      select: { ordem: true },
      limit: 0,
      depth: 0,
      ...comoUsuario,
    })
    const ordem = mover(irmaos.docs.map((p) => p.id), id, direcao)
    if (ordem) {
      const antes = new Map(irmaos.docs.map((p) => [p.id, p.ordem]))
      for (const [posicao, pid] of ordem.entries()) {
        if (antes.get(pid) !== posicao) {
          await payload.update({ collection: 'produtos', id: pid, data: { ordem: posicao }, ...comoUsuario })
        }
      }
    }
  }
  redirect('/painel/produtos')
}

// ---------- Categorias ----------

export async function salvarCategoria(id: number | null, _: Estado, form: FormData): Promise<Estado> {
  const { payload, loja, comoUsuario } = await sessao('cardapio')
  const nome = texto(form, 'nome')
  if (!nome) return { erro: 'Coloque o nome da categoria.' }
  const data = { nome, setor: lerSetor(texto(form, 'setor')) }
  try {
    if (id === null) {
      // Categoria nova entra no fim.
      const { totalDocs } = await payload.count({ collection: 'categorias', where: { loja: { equals: loja.id } } })
      await payload.create({ collection: 'categorias', data: { ...data, ordem: totalDocs, loja: loja.id }, ...comoUsuario })
    } else {
      await payload.update({
        collection: 'categorias',
        where: { id: { equals: id }, loja: { equals: loja.id } },
        data,
        ...comoUsuario,
      })
    }
  } catch (e) {
    return { erro: mensagem(e) }
  }
  return null
}

/** Sobe (-1) ou desce (1) uma categoria; renumera todas (0, 1, 2...) a cada troca. */
export async function moverCategoria(id: number, direcao: -1 | 1) {
  const { payload, loja, comoUsuario } = await sessao('cardapio')
  const todas = await payload.find({
    collection: 'categorias',
    where: { loja: { equals: loja.id } },
    sort: ['ordem', 'id'],
    select: { ordem: true },
    limit: 0,
    depth: 0,
    ...comoUsuario,
  })
  const ordem = mover(todas.docs.map((c) => c.id), id, direcao)
  if (ordem) {
    const antes = new Map(todas.docs.map((c) => [c.id, c.ordem]))
    for (const [posicao, cid] of ordem.entries()) {
      if (antes.get(cid) !== posicao) {
        await payload.update({ collection: 'categorias', id: cid, data: { ordem: posicao }, ...comoUsuario })
      }
    }
  }
  redirect('/painel/categorias')
}

export async function apagarCategoria(id: number): Promise<Estado> {
  const { payload, loja, user, comoUsuario } = await sessao('cardapio')
  if (!temPermissao(user, 'excluir')) return SEM_EXCLUIR
  const { totalDocs } = await payload.count({
    collection: 'produtos',
    where: { categoria: { equals: id }, loja: { equals: loja.id } },
  })
  if (totalDocs) {
    return { erro: `Esta categoria tem ${totalDocs} produto(s). Mude-os de categoria ou apague antes.` }
  }
  await payload.delete({
    collection: 'categorias',
    where: { id: { equals: id }, loja: { equals: loja.id } },
    ...comoUsuario,
  })
  redirect('/painel/categorias')
}

// ---------- Cupons ----------

export async function salvarCupom(_: Estado, form: FormData): Promise<Estado> {
  const { payload, loja, comoUsuario } = await sessao('cardapio')
  const codigo = normalizarCodigo(texto(form, 'codigo'))
  const porcentagem = texto(form, 'tipo') === 'porcentagem'
  const valor = lerPreco(texto(form, 'valor'))
  const minimo = texto(form, 'minimo') ? lerPreco(texto(form, 'minimo')) : null
  const dia = texto(form, 'validoAte')
  const limite = texto(form, 'limiteUso') ? Number(texto(form, 'limiteUso')) : null

  if (codigo.length < 3) return { erro: 'O código precisa de pelo menos 3 letras ou números.' }
  if (!valor || (porcentagem && valor > 100)) {
    return { erro: porcentagem ? 'Coloque uma porcentagem de 1 a 100.' : 'Coloque o valor do desconto.' }
  }
  if (texto(form, 'minimo') && minimo === null) return { erro: 'Pedido mínimo inválido. Use, por exemplo, 40,00.' }
  if (dia && !/^\d{4}-\d{2}-\d{2}$/.test(dia)) return { erro: 'Data inválida.' }
  if (limite !== null && (!Number.isInteger(limite) || limite < 1)) return { erro: 'O limite de usos precisa ser 1 ou mais.' }

  const { totalDocs } = await payload.count({
    collection: 'cupons',
    where: { loja: { equals: loja.id }, codigo: { equals: codigo } },
  })
  if (totalDocs) return { erro: `Já existe um cupom ${codigo}.` }

  try {
    await payload.create({
      collection: 'cupons',
      data: {
        loja: loja.id,
        codigo,
        tipo: porcentagem ? 'porcentagem' : 'valor',
        valor,
        minimo,
        validoAte: dia ? fimDoDia(dia) : null,
        limiteUso: limite,
        ativo: true,
      },
      ...comoUsuario,
    })
  } catch (e) {
    return { erro: mensagem(e) }
  }
  redirect('/painel/cupons')
}

export async function ligarCupom(id: number, ativo: boolean) {
  const { payload, loja, comoUsuario } = await sessao('cardapio')
  await payload.update({
    collection: 'cupons',
    where: { id: { equals: id }, loja: { equals: loja.id } },
    data: { ativo },
    ...comoUsuario,
  })
  redirect('/painel/cupons')
}

export async function apagarCupom(id: number): Promise<Estado> {
  const { payload, loja, user, comoUsuario } = await sessao('cardapio')
  if (!temPermissao(user, 'excluir')) return SEM_EXCLUIR
  await payload.delete({
    collection: 'cupons',
    where: { id: { equals: id }, loja: { equals: loja.id } },
    ...comoUsuario,
  })
  return null
}

// ---------- Estoque ----------

/** Cria (id nulo) ou edita um ingrediente. A quantidade só muda em `ajustarEstoque`, menos na criação. */
export async function salvarIngrediente(id: number | null, _: Estado, form: FormData): Promise<Estado> {
  const { payload, loja, comoUsuario } = await sessao('cardapio')
  const nome = texto(form, 'nome').slice(0, 80)
  const minimo = texto(form, 'minimo') ? lerQuantidade(texto(form, 'minimo')) : 0
  const inicial = texto(form, 'quantidade') ? lerQuantidade(texto(form, 'quantidade')) : 0
  if (!nome) return { erro: 'Coloque o nome do ingrediente.' }
  if (minimo === null) return { erro: 'Quantidade mínima inválida. Use, por exemplo, 2 ou 1,5.' }
  if (inicial === null) return { erro: 'Quantidade inválida. Use, por exemplo, 10 ou 2,5.' }
  const custo = texto(form, 'custo') ? lerQuantidade(texto(form, 'custo')) : null
  if (texto(form, 'custo') && custo === null) return { erro: 'Custo inválido. Use, por exemplo, 32 ou 0,035.' }

  const { totalDocs } = await payload.count({
    collection: 'ingredientes',
    where: { loja: { equals: loja.id }, nome: { equals: nome }, ...(id ? { id: { not_equals: id } } : {}) },
  })
  if (totalDocs) return { erro: `Já existe o ingrediente ${nome}.` }

  try {
    const data = { nome, unidade: lerUnidade(texto(form, 'unidade')), minimo, custo }
    if (id) {
      await payload.update({ collection: 'ingredientes', where: { id: { equals: id }, loja: { equals: loja.id } }, data, ...comoUsuario })
    } else {
      await payload.create({ collection: 'ingredientes', data: { ...data, quantidade: inicial, loja: loja.id }, ...comoUsuario })
    }
    if (id) await refazerPausa(payload, loja.id, [id])
  } catch (e) {
    return { erro: mensagem(e) }
  }
  redirect('/painel/estoque')
}

/** `somar`: entrou (ou saiu, com sinal de menos) esta quantidade. `definir`: a contagem de agora. */
export async function ajustarEstoque(id: number, _: Estado, form: FormData): Promise<Estado> {
  const { payload, loja, comoUsuario } = await sessao('cardapio')
  const definir = texto(form, 'modo') === 'definir'
  const valor = lerQuantidade(texto(form, 'valor'), { negativo: !definir })
  if (valor === null) return { erro: definir ? 'Coloque a contagem, por exemplo 8 ou 2,5.' : 'Coloque quanto entrou (use - para tirar), por exemplo 10 ou -2,5.' }
  const { docs } = await payload.find({ collection: 'ingredientes', where: { id: { equals: id }, loja: { equals: loja.id } }, limit: 1, depth: 0, ...comoUsuario })
  if (!docs[0]) return { erro: 'Ingrediente não encontrado.' }
  // ponytail: ler e gravar; duas pessoas ajustando o mesmo ingrediente no mesmo segundo podem se sobrepor. A baixa dos pedidos (#145) usa soma no banco.
  await payload.update({ collection: 'ingredientes', id, data: { quantidade: definir ? valor : somar(docs[0].quantidade, valor) }, ...comoUsuario })
  await refazerPausa(payload, loja.id, [id])
  redirect('/painel/estoque')
}

export async function apagarIngrediente(id: number): Promise<Estado> {
  const { payload, loja, user, comoUsuario } = await sessao('cardapio')
  if (!temPermissao(user, 'excluir')) return SEM_EXCLUIR
  const usado = await payload.count({ collection: 'produtos', where: { loja: { equals: loja.id }, 'ficha.ingrediente': { equals: id } } })
  if (usado.totalDocs) return { erro: 'Este ingrediente está na ficha técnica de um produto. Tire de lá antes de apagar.' }
  await payload.delete({ collection: 'ingredientes', where: { id: { equals: id }, loja: { equals: loja.id } }, ...comoUsuario })
  return null
}

// ---------- Impressão ----------

/** Configuração da impressão automática (quem edita a loja). Ligar marca o momento: o que veio antes não sai impresso. */
export async function salvarImpressao(_: Estado, form: FormData): Promise<Estado> {
  const { payload, loja, comoUsuario } = await sessao('loja')
  const ligada = marcado(form, 'impressaoAutomatica')
  const origens = ORIGENS.map((o) => o.value).filter((o) => form.getAll('imprimirOrigens').includes(o))
  try {
    await payload.update({
      collection: 'lojas',
      id: loja.id,
      data: {
        impressaoAutomatica: ligada,
        larguraTicket: lerLargura(texto(form, 'larguraTicket')),
        viasTicket: lerVias(texto(form, 'viasTicket')),
        imprimirOrigens: origens,
        ...(ligada && !loja.impressaoAutomatica && { impressaoDesde: new Date().toISOString() }),
      },
      ...comoUsuario,
    })
  } catch (e) {
    return { erro: mensagem(e) }
  }
  redirect('/painel/impressao')
}

/**
 * Reserva o pedido para imprimir: só uma tela consegue (a primeira que pedir). Reservar antes de imprimir
 * evita ticket em dobro com duas abas abertas; se a impressora falhar, o pedido tem o botão Reimprimir.
 */
export async function reservarImpressao(id: number): Promise<boolean> {
  const { payload, loja } = await sessao('pedidos')
  const r = await payload.db.drizzle.execute(
    sql`UPDATE "pedidos" SET "impresso" = true WHERE "id" = ${id} AND "loja_id" = ${loja.id} AND "impresso" IS NOT TRUE RETURNING "id"`,
  )
  return r.rows.length > 0
}

// ---------- Carrinhos abandonados ----------

export async function apagarCarrinho(id: number): Promise<Estado> {
  const { payload, loja, user, comoUsuario } = await sessao('pedidos')
  if (!temPermissao(user, 'excluir')) return SEM_EXCLUIR
  await payload.delete({
    collection: 'carrinhos',
    where: { id: { equals: id }, loja: { equals: loja.id } },
    ...comoUsuario,
  })
  return null
}

// ---------- Dados da loja ----------

/** Horário vem em campos (dias, abre, fecha). Sem nada escolhido, mantém o texto antigo se ele não seguia o formato. */
function lerHorarioDoForm(form: FormData, atual: string) {
  const dias = form.getAll('dias').map((d) => Number(d))
  const abre = texto(form, 'abre')
  const fecha = texto(form, 'fecha')
  if (!dias.length && !abre && !fecha) {
    return { ok: true as const, texto: form.get('horarioAntigo') === '1' ? atual : '' }
  }
  const hora = /^([01]\d|2[0-3]):[0-5]\d$/
  if (!dias.length) return { ok: false as const, erro: 'Marque os dias em que a loja abre.' }
  if (!hora.test(abre) || !hora.test(fecha)) return { ok: false as const, erro: 'Escolha a hora em que a loja abre e a em que fecha.' }
  if (dias.some((d) => !Number.isInteger(d) || d < 0 || d > 6)) return { ok: false as const, erro: 'Dia da semana inválido.' }
  return { ok: true as const, texto: montarHorario({ dias, abre, fecha }) }
}

export async function salvarLoja(_: Estado, form: FormData): Promise<Estado> {
  const { payload, loja, comoUsuario } = await sessao('loja')
  const nome = texto(form, 'nome')
  if (!nome) return { erro: 'Coloque o nome da loja.' }
  const taxa = lerPreco(texto(form, 'taxaEntrega') || '0')
  const formasPagamento = FORMAS_PAGAMENTO.map((f) => f.value).filter((v) => form.getAll('formasPagamento').includes(v))
  if (!formasPagamento.length) return { erro: 'Marque pelo menos uma forma de pagamento.' }
  const chavePix = texto(form, 'chavePix').slice(0, 100)
  if (formasPagamento.includes('pix') && !chavePix) {
    return { erro: 'Coloque a chave Pix ou desmarque Pix nas formas de pagamento.' }
  }
  if (taxa === null) return { erro: 'Taxa de entrega inválida. Use, por exemplo, 6,00.' }
  const bairros = lerBairros(texto(form, 'bairros'))
  if (!bairros.ok) return { erro: bairros.erro }
  const mesas = lerMesas(texto(form, 'mesas'))
  if (!mesas.ok) return { erro: mesas.erro }
  const taxaServico = lerTaxaServico(texto(form, 'taxaServico'))
  if (!taxaServico.ok) return { erro: taxaServico.erro }
  const pixelMeta = lerPixelMeta(texto(form, 'pixelMeta'))
  if (!pixelMeta.ok) return { erro: pixelMeta.erro }
  const whatsapp = texto(form, 'whatsapp')
  if (!whatsappUrl(whatsapp)) return { erro: 'WhatsApp incompleto. Use DDD e número, por exemplo (31) 99999-0000.' }
  const horario = lerHorarioDoForm(form, loja.horario ?? '')
  if (!horario.ok) return { erro: horario.erro }
  const tagGoogle = lerTagGoogle(texto(form, 'tagGoogle'))
  if (!tagGoogle.ok) return { erro: tagGoogle.erro }

  try {
    const logo = await imagem(form, 'logo', `Logo da ${nome}`)
    const capa = await imagem(form, 'capa', `Capa da ${nome}`)
    await payload.update({
      collection: 'lojas',
      id: loja.id,
      data: {
        nome,
        whatsapp,
        corPrincipal: texto(form, 'corPrincipal'),
        fonte: texto(form, 'fonte') as Loja['fonte'],
        horario: horario.texto,
        endereco: montarEndereco({
          rua: texto(form, 'enderecoRua'),
          numero: texto(form, 'enderecoNumero'),
          bairro: texto(form, 'enderecoBairro'),
          cidade: texto(form, 'enderecoCidade'),
        }).slice(0, 200),
        aberta: marcado(form, 'aberta'),
        fazEntrega: marcado(form, 'fazEntrega'),
        taxaEntrega: taxa,
        bairros: bairros.bairros,
        mesas: texto(form, 'mesas'),
        taxaServico: taxaServico.valor,
        atendimentoMesas: (['ambos', 'garcom', 'cliente'] as const).find((a) => a === texto(form, 'atendimentoMesas')) ?? 'ambos',
        aceitaRetirada: marcado(form, 'aceitaRetirada'),
        aceitaAgendamento: marcado(form, 'aceitaAgendamento'),
        aceiteAutomatico: marcado(form, 'aceiteAutomatico'),
        formasPagamento,
        chavePix,
        pixelMeta: pixelMeta.id,
        tagGoogle: tagGoogle.id,
        ...(logo !== undefined && { logo }),
        ...(capa !== undefined && { capa }),
      },
      ...comoUsuario,
    })
  } catch (e) {
    return { erro: e instanceof Error && !('data' in e) ? e.message : mensagem(e) }
  }
  redirect('/painel/loja?salvo=1')
}

/** Texto impresso embaixo dos QR Codes das mesas; vazio volta ao texto sugerido. */
export async function salvarInstrucoesMesa(_: Estado, form: FormData): Promise<Estado> {
  const { payload, loja, comoUsuario } = await sessao('loja')
  try {
    await payload.update({
      collection: 'lojas',
      id: loja.id,
      data: { instrucoesMesa: texto(form, 'instrucoes').slice(0, 400) },
      ...comoUsuario,
    })
  } catch (e) {
    return { erro: mensagem(e) }
  }
  redirect('/painel/mesas/qr')
}

// ---------- Financeiro ----------

export async function salvarLancamento(_: Estado, form: FormData): Promise<Estado> {
  const { payload, loja, comoUsuario } = await sessao('financeiro')
  const tipo = TIPOS.find((t) => t.value === texto(form, 'tipo'))?.value
  const descricao = texto(form, 'descricao').slice(0, 120)
  const valor = lerPreco(texto(form, 'valor'))
  const vencimento = lerData(texto(form, 'vencimento'))
  const categoria = CATEGORIAS.find((c) => c === texto(form, 'categoria'))
  if (!tipo) return { erro: 'Escolha se é a pagar ou a receber.' }
  if (!descricao) return { erro: 'Coloque a descrição da conta.' }
  if (valor === null || valor <= 0) return { erro: 'Valor inválido. Use, por exemplo, 1500,00.' }
  if (!vencimento) return { erro: 'Escolha a data de vencimento.' }
  try {
    await payload.create({
      collection: 'lancamentos',
      data: {
        loja: loja.id,
        tipo,
        descricao,
        valor,
        vencimento,
        categoria,
        observacao: texto(form, 'observacao').slice(0, 300),
        repetir: marcado(form, 'repetir'),
        diaDoMes: Number(vencimento.slice(8)),
      },
      ...comoUsuario,
    })
  } catch (e) {
    return { erro: mensagem(e) }
  }
  redirect(`/painel/financeiro?aba=${tipo}`)
}

/** Dá baixa: data e valor pagos (podem ter juros ou desconto). Conta fixa gera a do mês seguinte. */
export async function baixarLancamento(id: number, form: FormData) {
  const { payload, loja, comoUsuario } = await sessao('financeiro')
  const { docs } = await payload.find({
    collection: 'lancamentos',
    where: { id: { equals: id }, loja: { equals: loja.id }, pagoEm: { exists: false } },
    limit: 1,
    depth: 0,
    ...comoUsuario,
  })
  const conta = docs[0]
  const pagoEm = lerData(texto(form, 'pagoEm'))
  const valorPago = lerPreco(texto(form, 'valorPago') || String(conta?.valor ?? ''))
  if (conta && pagoEm && valorPago !== null) {
    await payload.update({ collection: 'lancamentos', id, data: { pagoEm, valorPago }, ...comoUsuario })
    if (conta.repetir) {
      await payload.create({
        collection: 'lancamentos',
        data: {
          loja: loja.id,
          tipo: conta.tipo,
          descricao: conta.descricao,
          valor: conta.valor,
          vencimento: proximoVencimento(conta.vencimento, conta.diaDoMes ?? undefined),
          categoria: conta.categoria,
          observacao: conta.observacao,
          repetir: true,
          diaDoMes: conta.diaDoMes,
        },
        ...comoUsuario,
      })
    }
  }
  redirect(voltarAoFinanceiro(form, (conta?.tipo as Tipo | undefined) ?? 'pagar'))
}

/** Volta ao Financeiro na mesma aba e no mesmo mês em que o dono estava (campos escondidos do formulário). */
function voltarAoFinanceiro(form: FormData, abaPadrao: string) {
  const aba = TIPOS.find((t) => t.value === texto(form, 'aba'))?.value ?? abaPadrao
  return `/painel/financeiro?aba=${aba}&mes=${intervaloDoMes(texto(form, 'mes')).mes}`
}

export async function apagarLancamento(id: number): Promise<Estado> {
  const { payload, loja, user, comoUsuario } = await sessao('financeiro')
  if (!temPermissao(user, 'excluir')) return SEM_EXCLUIR
  await payload.delete({
    collection: 'lancamentos',
    where: { id: { equals: id }, loja: { equals: loja.id } },
    ...comoUsuario,
  })
  return null
}

// ---------- Garçons ----------

/** Usuário do garçom: letras minúsculas, números, _ e -. Vira "usuario.loja" para não repetir entre lojas. */
const USUARIO = /^[a-z0-9_-]{3,20}$/

export async function salvarGarcom(_: Estado, form: FormData): Promise<Estado> {
  const { payload, loja } = await sessao('equipe')
  const nome = texto(form, 'nome').slice(0, 80)
  const usuario = texto(form, 'usuario').toLowerCase()
  const senha = String(form.get('senha') ?? '')
  if (!nome) return { erro: 'Coloque o nome do garçom.' }
  if (!USUARIO.test(usuario)) return { erro: 'Usuário com 3 a 20 letras, números, _ ou -, sem espaço nem acento.' }
  if (senha.length < 6) return { erro: 'A senha precisa de pelo menos 6 caracteres.' }
  try {
    // O garçom não tem acesso próprio aos dados, então criamos como o servidor, depois de conferir o login do dono acima.
    await payload.create({
      collection: 'users',
      data: { username: loginDoGarcom(usuario, loja.slug), password: senha, nome, roles: ['garcom'], lojaDoGarcom: loja.id, ativo: true },
    })
  } catch (e) {
    return { erro: /unique|already|username/i.test(String(e)) ? 'Já existe um garçom com esse usuário.' : mensagem(e) }
  }
  redirect('/painel/garcons')
}

/** Só mexe em garçom desta loja: confere antes de gravar. */
async function mudarGarcom(id: number, data: { ativo: boolean } | { password: string }) {
  const { payload, loja } = await sessao('equipe')
  const { docs } = await payload.find({
    collection: 'users',
    where: { id: { equals: id }, lojaDoGarcom: { equals: loja.id }, roles: { contains: 'garcom' } },
    limit: 1,
    depth: 0,
  })
  if (docs[0]) await payload.update({ collection: 'users', id, data })
}

export async function ligarGarcom(id: number, ativo: boolean) {
  await mudarGarcom(id, { ativo })
  redirect('/painel/garcons')
}

export async function trocarSenhaGarcom(id: number, _: Estado, form: FormData): Promise<Estado> {
  const senha = String(form.get('senha') ?? '')
  if (senha.length < 6) return { erro: 'A senha precisa de pelo menos 6 caracteres.' }
  await mudarGarcom(id, { password: senha })
  redirect('/painel/garcons')
}

// ---------- Usuários da loja ----------

type Contexto = Awaited<ReturnType<typeof sessao>>

/** Usuários de painel desta loja (nunca administrador nem garçom), do mais antigo ao mais novo. */
async function usuariosDaLoja({ payload, loja }: Pick<Contexto, 'payload' | 'loja'>) {
  const { docs } = await payload.find({
    collection: 'users',
    where: { 'tenants.tenant': { equals: loja.id }, roles: { contains: 'loja' } },
    sort: 'createdAt',
    limit: 0,
    depth: 0,
  })
  return docs.filter((u) => !u.roles?.includes('admin') && !u.roles?.includes('garcom'))
}

/**
 * Confere antes de mexer em outro usuário: ele é desta loja, o usuário de quem mexe não é ele mesmo
 * (ninguém tira o próprio acesso por engano) e não tem permissões que quem mexe não tem.
 */
async function alvoDoUsuario(ctx: Contexto, id: number) {
  const todos = await usuariosDaLoja(ctx)
  const alvo = todos.find((u) => u.id === id)
  if (!alvo) return { erro: 'Usuário não encontrado.' } as const
  if (alvo.id === ctx.user.id) return { erro: 'Você não pode fazer isso com o seu próprio usuário.' } as const
  if (!contido(efetivas(alvo), efetivas(ctx.user))) {
    return { erro: 'Este usuário tem permissões que você não tem. Peça a quem tem.' } as const
  }
  return { alvo, todos } as const
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function salvarUsuario(id: number | null, _: Estado, form: FormData): Promise<Estado> {
  const ctx = await sessao('usuarios')
  const { payload, loja, user } = ctx
  const nome = texto(form, 'nome').slice(0, 80)
  if (!nome) return { erro: 'Coloque o nome do usuário.' }
  const permissoes = lerPermissoes(form.getAll('permissoes'))
  if (!permissoes.length) return { erro: 'Marque pelo menos uma permissão.' }
  if (!contido(permissoes, efetivas(user))) return { erro: 'Você só pode dar permissões que você mesmo tem.' }

  // O login é o usuário ("maria.slug-da-loja", como o garçom); o e-mail é opcional.
  const usuario = texto(form, 'usuario').toLowerCase()
  if (usuario && !USUARIO.test(usuario)) return { erro: 'Usuário com 3 a 20 letras, números, _ ou -, sem espaço nem acento.' }
  const login = usuario ? loginDoGarcom(usuario, loja.slug) : undefined

  if (id === null) {
    const email = texto(form, 'email').toLowerCase()
    const senha = String(form.get('senha') ?? '')
    if (!login) return { erro: 'Coloque o usuário (é o login).' }
    if (email && !EMAIL.test(email)) return { erro: 'E-mail inválido.' }
    if (senha.length < 8) return { erro: 'A senha inicial precisa de pelo menos 8 caracteres.' }
    try {
      // O usuário nasce só desta loja. Criamos como o servidor, depois de conferir o login de quem cria.
      await payload.create({
        collection: 'users',
        data: {
          username: login,
          ...(email && { email }),
          password: senha,
          nome,
          roles: ['loja'],
          tenants: [{ tenant: loja.id }],
          permissoes,
          ativo: true,
        },
      })
    } catch (e) {
      return { erro: /unique|already|registrad|e-?mail|username/i.test(String(e)) ? 'Já existe um usuário com esse usuário ou e-mail.' : mensagem(e) }
    }
    redirect('/painel/usuarios')
  }

  const r = await alvoDoUsuario(ctx, id)
  if (!r.alvo) return { erro: r.erro }
  const depois = r.todos.map((u) => (u.id === id ? { ...u, permissoes } : u))
  if (gerentes(depois) === 0) {
    return { erro: 'A loja precisa ter pelo menos um usuário que gerencia usuários.' }
  }
  // Quem ainda não tem usuário (criado só com e-mail) pode definir um; depois de definido não muda.
  const novoLogin = login && !r.alvo.username ? login : undefined
  try {
    await payload.update({ collection: 'users', id, data: { nome, permissoes, ...(novoLogin && { username: novoLogin }) } })
  } catch (e) {
    return { erro: /unique|already|registrad|username/i.test(String(e)) ? 'Já existe um usuário com esse usuário.' : mensagem(e) }
  }
  redirect('/painel/usuarios')
}

/** Quando o erro não tem formulário (botão Ligar/Desligar), a tela mostra o aviso que vai na URL. */
const avisoUsuarios = (erro: string) => redirect(`/painel/usuarios?aviso=${encodeURIComponent(erro)}`)

export async function ligarUsuario(id: number, ativo: boolean) {
  const ctx = await sessao('usuarios')
  const r = await alvoDoUsuario(ctx, id)
  if (!r.alvo) return avisoUsuarios(r.erro)
  if (!ativo && gerentes(r.todos.map((u) => (u.id === id ? { ...u, ativo: false } : u))) === 0) {
    return avisoUsuarios('A loja precisa ter pelo menos um usuário que gerencia usuários.')
  }
  await ctx.payload.update({ collection: 'users', id, data: { ativo } })
  redirect('/painel/usuarios')
}

/** Troca a senha de um usuário da loja, ou a sua própria. */
export async function trocarSenhaUsuario(id: number, _: Estado, form: FormData): Promise<Estado> {
  const ctx = await sessao('usuarios')
  const senha = String(form.get('senha') ?? '')
  if (senha.length < 8) return { erro: 'A senha precisa de pelo menos 8 caracteres.' }
  if (id !== ctx.user.id) {
    const r = await alvoDoUsuario(ctx, id)
    if (!r.alvo) return { erro: r.erro }
  }
  await ctx.payload.update({ collection: 'users', id, data: { password: senha } })
  redirect('/painel/usuarios')
}

export async function apagarUsuario(id: number): Promise<Estado> {
  const ctx = await sessao('usuarios')
  if (!temPermissao(ctx.user, 'excluir')) return SEM_EXCLUIR
  const r = await alvoDoUsuario(ctx, id)
  if (!r.alvo) return { erro: r.erro }
  if (gerentes(r.todos.filter((u) => u.id !== id)) === 0) {
    return { erro: 'A loja precisa ter pelo menos um usuário que gerencia usuários.' }
  }
  await ctx.payload.delete({ collection: 'users', id })
  return null
}

/**
 * Compara o relatório da maquininha (texto CSV) com os pagamentos em cartão da loja nos mesmos dias.
 * O arquivo não é guardado. Com `lancar`, o líquido de cada data prevista vira uma conta a receber
 * (uma por data; repetir a conferência do mesmo relatório não duplica).
 */
export async function conferirMaquininha(texto: string, lancar: boolean) {
  const { payload, loja, comoUsuario } = await sessao('financeiro')
  if (texto.length > 1_000_000) return { erro: 'Arquivo grande demais. Envie o relatório de um período menor.' }
  const leitura = lerRelatorio(texto)
  if (!leitura.vendas.length) return { erro: leitura.erros[0]?.motivo ?? 'Não achei vendas no relatório.' }

  const dias = leitura.vendas.map((v) => v.dia).sort()
  const primeiro = dias[0]
  const ultimo = dias[dias.length - 1]
  const folga = TOLERANCIA_MIN * 60_000
  const inicio = new Date(`${primeiro}T00:00:00-03:00`).getTime() - folga
  const fim = new Date(`${somarDias(ultimo, 1)}T00:00:00-03:00`).getTime() + folga
  const busca = { limit: 0, depth: 0, ...comoUsuario } as const
  // Pedidos feitos até um dia antes podem ter sido finalizados dentro do período.
  const desde = new Date(`${somarDias(primeiro, -1)}T00:00:00-03:00`).toISOString()
  const [pedidos, fechamentos] = await Promise.all([
    payload.find({
      collection: 'pedidos',
      where: {
        loja: { equals: loja.id },
        status: { equals: 'entregue' },
        pagamento: { equals: 'cartao' },
        mesa: { exists: false },
        createdAt: { greater_than_equal: desde, less_than: new Date(fim).toISOString() },
      },
      ...busca,
    }),
    payload.find({
      collection: 'fechamentos',
      where: { loja: { equals: loja.id }, createdAt: { greater_than_equal: new Date(inicio).toISOString(), less_than: new Date(fim).toISOString() } },
      ...busca,
    }),
  ])
  const pagamentos: PagamentoLoja[] = [
    // ponytail: updatedAt é a finalização (ou o acerto do entregador, que só alarga a janela); precisa de campo próprio se a janela ficar larga demais.
    ...pedidos.docs.map((p) => ({
      id: `p${p.id}`,
      rotulo: `Pedido nº ${p.numero} · ${p.nome}`,
      valor: p.total,
      de: new Date(p.createdAt).getTime(),
      ate: new Date(p.updatedAt).getTime(),
    })),
    ...fechamentos.docs.flatMap((f) =>
      (f.pagamentos ?? [])
        .filter((x) => x.forma === 'cartao')
        .map((x, i) => ({
          id: `f${f.id}-${i}`,
          rotulo: `Mesa ${f.mesa}`,
          valor: x.valor,
          de: new Date(f.createdAt).getTime(),
          ate: new Date(f.createdAt).getTime(),
        })),
    ),
  ].filter((x) => x.ate >= inicio && x.de <= fim)

  const resultado = conferir(leitura.vendas, pagamentos)

  let lancados = 0
  if (lancar) {
    for (const { data, valor } of recebimentosPorData(leitura.vendas)) {
      const descricao = `Maquininha · recebimento de ${data.split('-').reverse().join('/')}`
      const { totalDocs } = await payload.count({
        collection: 'lancamentos',
        where: { loja: { equals: loja.id }, tipo: { equals: 'receber' }, descricao: { equals: descricao } },
        ...comoUsuario,
      })
      if (totalDocs) continue
      await payload.create({
        collection: 'lancamentos',
        data: { loja: loja.id, tipo: 'receber', descricao, valor, vencimento: data, categoria: 'Outros', repetir: false },
        ...comoUsuario,
      })
      lancados++
    }
  }

  return {
    erro: null,
    resultado,
    erros: leitura.erros,
    ignoradas: leitura.ignoradas,
    temTaxa: leitura.temTaxa,
    semPrevisao: lancar && !recebimentosPorData(leitura.vendas).length,
    lancados,
  }
}

// ---------- Caixa do dia ----------

/** O caixa aberto da loja, se houver (só um por vez). */
async function caixaAberto(payload: Payload, lojaId: number) {
  const { docs } = await payload.find({
    collection: 'caixas',
    where: { loja: { equals: lojaId }, fechadoEm: { exists: false } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return docs[0] ?? null
}

export async function abrirCaixa(_: Estado, form: FormData): Promise<Estado> {
  const { payload, loja, user } = await sessao('financeiro')
  const troco = lerPreco(texto(form, 'trocoInicial') || '0')
  if (troco === null) return { erro: 'Troco inválido. Use, por exemplo, 100,00.' }
  if (await caixaAberto(payload, loja.id)) return { erro: 'Já existe um caixa aberto. Feche antes de abrir outro.' }
  await payload.create({
    collection: 'caixas',
    overrideAccess: true,
    data: { loja: loja.id, abertoEm: new Date().toISOString(), trocoInicial: troco, abertoPor: user.id },
  })
  redirect('/painel/caixa')
}

/** Sangria (tirou dinheiro da gaveta) ou suprimento (pôs), sempre com o motivo. */
export async function movimentarCaixa(_: Estado, form: FormData): Promise<Estado> {
  const { payload, loja } = await sessao('financeiro')
  const tipo = lerMovimento(texto(form, 'tipo'))
  const valor = lerPreco(texto(form, 'valor'))
  const motivo = texto(form, 'motivo').slice(0, 120)
  if (!tipo) return { erro: 'Escolha sangria ou suprimento.' }
  if (valor === null || valor <= 0) return { erro: 'Valor inválido. Use, por exemplo, 50,00.' }
  if (!motivo) return { erro: 'Diga o motivo, por exemplo "pagou o gás".' }
  const caixa = await caixaAberto(payload, loja.id)
  if (!caixa) return { erro: 'Não há caixa aberto.' }
  // ponytail: ler e gravar a lista; dois lançamentos no mesmo segundo podem se sobrepor.
  await payload.update({
    collection: 'caixas',
    id: caixa.id,
    overrideAccess: true,
    data: { movimentos: [...(caixa.movimentos ?? []), { tipo, valor, motivo, em: new Date().toISOString() }] },
  })
  redirect('/painel/caixa')
}

/** Fecha o caixa: o sistema calcula o esperado em dinheiro e guarda a diferença para o contado. */
export async function fecharCaixa(_: Estado, form: FormData): Promise<Estado> {
  const { payload, loja, user } = await sessao('financeiro')
  const contado = lerPreco(texto(form, 'contado'))
  if (contado === null) return { erro: 'Coloque o dinheiro contado na gaveta, por exemplo 350,00.' }
  const caixa = await caixaAberto(payload, loja.id)
  if (!caixa) return { erro: 'Não há caixa aberto.' }
  const agora = new Date().toISOString()
  const vendas = await vendasDoPeriodo(payload, loja.id, caixa.abertoEm, agora)
  const esperado = dinheiroEsperado(caixa.trocoInicial, vendas.get('dinheiro') ?? 0, caixa.movimentos ?? [])
  await payload.update({
    collection: 'caixas',
    id: caixa.id,
    overrideAccess: true,
    data: { fechadoEm: agora, esperado, contado, diferenca: diferenca(contado, esperado), observacao: texto(form, 'observacao').slice(0, 300), fechadoPor: user.id },
  })
  redirect('/painel/caixa')
}

// ---------- Fornecedores e compras ----------

export async function salvarFornecedor(id: number | null, _: Estado, form: FormData): Promise<Estado> {
  const { payload, loja, comoUsuario } = await sessao('financeiro')
  const nome = texto(form, 'nome').slice(0, 80)
  if (!nome) return { erro: 'Coloque o nome do fornecedor.' }
  const { totalDocs } = await payload.count({
    collection: 'fornecedores',
    where: { loja: { equals: loja.id }, nome: { equals: nome }, ...(id ? { id: { not_equals: id } } : {}) },
  })
  if (totalDocs) return { erro: `Já existe o fornecedor ${nome}.` }
  const data = { nome, telefone: texto(form, 'telefone').slice(0, 30), observacao: texto(form, 'observacao').slice(0, 300) }
  try {
    if (id) await payload.update({ collection: 'fornecedores', where: { id: { equals: id }, loja: { equals: loja.id } }, data, ...comoUsuario })
    else await payload.create({ collection: 'fornecedores', data: { ...data, loja: loja.id }, ...comoUsuario })
  } catch (e) {
    return { erro: mensagem(e) }
  }
  redirect('/painel/compras')
}

export async function apagarFornecedor(id: number): Promise<Estado> {
  const { payload, loja, user, comoUsuario } = await sessao('financeiro')
  if (!temPermissao(user, 'excluir')) return SEM_EXCLUIR
  const compras = await payload.count({ collection: 'compras', where: { loja: { equals: loja.id }, fornecedor: { equals: id } } })
  if (compras.totalDocs) return { erro: 'Este fornecedor tem compras registradas e não pode ser apagado.' }
  await payload.delete({ collection: 'fornecedores', where: { id: { equals: id }, loja: { equals: loja.id } }, ...comoUsuario })
  return null
}

/**
 * Registra a compra: guarda, cria a conta a pagar (já paga, se foi na hora), soma no estoque e passa
 * o custo de cada ingrediente para o último preço pago por unidade.
 */
export async function registrarCompra(_: Estado, form: FormData): Promise<Estado> {
  const { payload, loja } = await sessao('financeiro')
  const [fornecedores, ingredientes] = await Promise.all([
    payload.find({ collection: 'fornecedores', where: { id: { equals: Number(texto(form, 'fornecedor')) || 0 }, loja: { equals: loja.id } }, limit: 1, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'ingredientes', where: { loja: { equals: loja.id } }, limit: 0, depth: 0, overrideAccess: true }),
  ])
  const fornecedor = fornecedores.docs[0]
  if (!fornecedor) return { erro: 'Escolha o fornecedor.' }
  const dia = texto(form, 'data') ? lerData(texto(form, 'data')) : hojeEmBrasilia()
  if (!dia) return { erro: 'Data da compra inválida.' }
  const aVista = marcado(form, 'aVista')
  const vencimento = aVista ? dia : lerData(texto(form, 'vencimento'))
  if (!vencimento) return { erro: 'Escolha o vencimento ou marque que pagou na hora.' }
  const lidos = lerItensCompra(texto(form, 'itens'), ingredientes.docs.map((i) => i.id))
  if (!lidos.ok) return { erro: lidos.erro }
  const itens = lidos.itens
  const total = totalDaCompra(itens)

  let lancamentoId: number | undefined
  try {
    const lancamento = await payload.create({
      collection: 'lancamentos',
      overrideAccess: true,
      data: {
        loja: loja.id,
        tipo: 'pagar',
        descricao: `Compra: ${fornecedor.nome}`.slice(0, 120),
        valor: total,
        vencimento,
        categoria: 'Fornecedores',
        ...(aVista && { pagoEm: dia, valorPago: total }),
      },
    })
    lancamentoId = lancamento.id
    await payload.create({
      collection: 'compras',
      overrideAccess: true,
      data: {
        loja: loja.id,
        fornecedor: fornecedor.id,
        data: dia,
        itens: itens.map((i) => ({ ingrediente: i.ingrediente, quantidade: i.quantidade, total: i.total, custo: i.custo })),
        total,
        aVista,
        vencimento,
        lancamento: lancamento.id,
        observacao: texto(form, 'observacao').slice(0, 300),
      },
    })
  } catch (e) {
    // Sem a compra, a conta a pagar não pode ficar solta.
    if (lancamentoId) await payload.delete({ collection: 'lancamentos', id: lancamentoId, overrideAccess: true }).catch(() => {})
    return { erro: mensagem(e) }
  }
  for (const i of itens) {
    // Soma no próprio banco, como a baixa dos pedidos: não atropela um pedido que chega no mesmo instante.
    await payload.db.drizzle.execute(sql`UPDATE "ingredientes" SET "quantidade" = "quantidade" + ${i.quantidade}, "custo" = ${i.custo} WHERE "id" = ${i.ingrediente} AND "loja_id" = ${loja.id}`)
  }
  await refazerPausa(payload, loja.id, itens.map((i) => i.ingrediente))
  redirect('/painel/compras')
}

/** A loja marca (ou desmarca) que o cliente aceitou receber promoções. Sem linha em "contatos" = não aceitou. */
export async function marcarPromocoes(telefone: string, aceita: boolean) {
  const { payload, loja, comoUsuario } = await sessao('pedidos')
  const tel = normalizarTelefone(telefone)
  if (!tel) return
  const data = { aceitaPromocoes: aceita, aceitouEm: aceita ? new Date().toISOString() : null }
  const { docs } = await payload.find({ collection: 'contatos', where: { loja: { equals: loja.id }, telefone: { equals: tel } }, limit: 1, depth: 0, ...comoUsuario })
  if (docs[0]) await payload.update({ collection: 'contatos', id: docs[0].id, data, ...comoUsuario })
  else await payload.create({ collection: 'contatos', data: { ...data, telefone: tel, loja: loja.id }, ...comoUsuario })
  revalidatePath('/painel/clientes')
}
