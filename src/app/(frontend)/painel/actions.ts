'use server'

/**
 * Tudo o que o painel da loja grava. Cada ação começa por `sessao()`, que confere o login
 * e a loja; as gravações vão como o usuário logado, e o Payload confere o acesso de novo.
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload, type Payload } from 'payload'

import { COOKIE_LOJA, sessao } from '@/lib/painel'
import { STATUS, type Status } from '@/lib/pedidosDoDia'
import { fimDoDia, normalizarCodigo } from '@/lib/cupom'
import { lerBairros, taxaDoBairro } from '@/lib/entrega'
import type { Parada } from '@/lib/entregadores'
import { whatsappUrl } from '@/lib/whatsapp'
import { lerMesas } from '@/lib/mesas'
import { lerPixelMeta, lerTagGoogle } from '@/lib/pixel'
import { gruposDoProduto, lerOpcoes } from '@/lib/opcoes'
import { promocaoDoProduto } from '@/lib/promocao'
import { lerSelos } from '@/lib/selos'
import { FORMAS_PAGAMENTO, type FormaPagamento, type ItemEscolhido, montarPedido } from '@/lib/pedido'
import { normalizarTelefone } from '@/lib/cliente'
import { comCidade, linkMaps, MAX_PARADAS } from '@/lib/rota'
import { lerPreco } from '@/lib/planilha'
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
  // O mesmo cookie do /admin: quem entra aqui também está logado lá (e vice-versa).
  ;(await cookies()).set(tokenCookie(payload), resultado.token ?? '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: resultado.exp ? new Date(resultado.exp * 1000) : undefined,
  })
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
  const { lojas } = await sessao()
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
  const { payload, loja, comoUsuario } = await sessao()
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
  const { payload, loja, comoUsuario } = await sessao()
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

/** Fecha a conta da mesa: os pedidos dela saem da lista de contas abertas. */
export async function fecharConta(mesa: string): Promise<{ ok: boolean }> {
  const { payload, loja, comoUsuario } = await sessao()
  try {
    await payload.update({
      collection: 'pedidos',
      where: { loja: { equals: loja.id }, mesa: { equals: mesa }, contaFechada: { not_equals: true } },
      data: { contaFechada: true },
      ...comoUsuario,
    })
    return { ok: true }
  } catch {
    return { ok: false }
  }
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
  const { payload, loja, comoUsuario } = await sessao()
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
  const { payload, loja, comoUsuario } = await sessao()
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
  const { payload, loja, comoUsuario } = await sessao()
  await payload.update({
    collection: 'entregadores',
    where: { id: { equals: id }, loja: { equals: loja.id } },
    data: { ativo },
    ...comoUsuario,
  })
  redirect('/painel/entregadores')
}

/** Põe o entregador (ou tira, com null) nos pedidos de entrega escolhidos. */
export async function atribuirEntregador(ids: number[], entregador: number | null): Promise<{ ok: boolean }> {
  const { payload, loja, comoUsuario } = await sessao()
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
  const { payload, loja, comoUsuario } = await sessao()
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
  const { payload, loja, comoUsuario } = await sessao()
  const nome = texto(form, 'nome')
  const preco = lerPreco(texto(form, 'preco'))
  if (!nome) return { erro: 'Coloque o nome do produto.' }
  if (preco === null) return { erro: 'Preço inválido. Use, por exemplo, 32,90.' }
  const leve = texto(form, 'leve') ? Number(texto(form, 'leve')) : null
  const pague = texto(form, 'pague') ? Number(texto(form, 'pague')) : null
  if ((leve || pague) && !promocaoDoProduto({ leve, pague })) {
    return { erro: 'Na promoção, preencha "leve" (2 ou mais) e "pague" (um número menor que o "leve"), ou deixe os dois vazios.' }
  }
  const opcoes = lerOpcoes(texto(form, 'opcoes'))
  if (!opcoes.ok) return { erro: opcoes.erro }

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
      ordem: Number(form.get('ordem')) || 0,
      opcoes: opcoes.grupos,
      leve,
      pague,
      selos: lerSelos(form.getAll('selos')),
      ...(foto !== undefined && { foto }),
    }
    if (id === null) {
      await payload.create({ collection: 'produtos', data: { ...data, loja: loja.id }, ...comoUsuario })
    } else {
      const r = await payload.update({
        collection: 'produtos',
        where: { id: { equals: id }, loja: { equals: loja.id } },
        data,
        ...comoUsuario,
      })
      if (r.docs.length !== 1) return { erro: 'Produto não encontrado.' }
    }
  } catch (e) {
    return { erro: e instanceof Error && !('data' in e) ? e.message : mensagem(e) }
  }
  redirect('/painel/produtos')
}

export async function apagarProduto(id: number) {
  const { payload, loja, comoUsuario } = await sessao()
  await payload.delete({
    collection: 'produtos',
    where: { id: { equals: id }, loja: { equals: loja.id } },
    ...comoUsuario,
  })
  redirect('/painel/produtos')
}

export async function marcarEsgotado(id: number, esgotado: boolean) {
  const { payload, loja, comoUsuario } = await sessao()
  await payload.update({
    collection: 'produtos',
    where: { id: { equals: id }, loja: { equals: loja.id } },
    data: { esgotado },
    ...comoUsuario,
  })
  redirect('/painel/produtos')
}

// ---------- Categorias ----------

export async function salvarCategoria(id: number | null, _: Estado, form: FormData): Promise<Estado> {
  const { payload, loja, comoUsuario } = await sessao()
  const nome = texto(form, 'nome')
  if (!nome) return { erro: 'Coloque o nome da categoria.' }
  const data = { nome, ordem: Number(form.get('ordem')) || 0 }
  try {
    if (id === null) {
      await payload.create({ collection: 'categorias', data: { ...data, loja: loja.id }, ...comoUsuario })
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
  redirect('/painel/categorias')
}

export async function apagarCategoria(id: number, _: Estado): Promise<Estado> {
  const { payload, loja, comoUsuario } = await sessao()
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
  const { payload, loja, comoUsuario } = await sessao()
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
  const { payload, loja, comoUsuario } = await sessao()
  await payload.update({
    collection: 'cupons',
    where: { id: { equals: id }, loja: { equals: loja.id } },
    data: { ativo },
    ...comoUsuario,
  })
  redirect('/painel/cupons')
}

export async function apagarCupom(id: number) {
  const { payload, loja, comoUsuario } = await sessao()
  await payload.delete({
    collection: 'cupons',
    where: { id: { equals: id }, loja: { equals: loja.id } },
    ...comoUsuario,
  })
  redirect('/painel/cupons')
}

// ---------- Carrinhos abandonados ----------

export async function apagarCarrinho(id: number) {
  const { payload, loja, comoUsuario } = await sessao()
  await payload.delete({
    collection: 'carrinhos',
    where: { id: { equals: id }, loja: { equals: loja.id } },
    ...comoUsuario,
  })
  redirect('/painel/carrinhos')
}

// ---------- Dados da loja ----------

export async function salvarLoja(_: Estado, form: FormData): Promise<Estado> {
  const { payload, loja, comoUsuario } = await sessao()
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
  const pixelMeta = lerPixelMeta(texto(form, 'pixelMeta'))
  if (!pixelMeta.ok) return { erro: pixelMeta.erro }
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
        whatsapp: texto(form, 'whatsapp'),
        corPrincipal: texto(form, 'corPrincipal'),
        fonte: texto(form, 'fonte') as Loja['fonte'],
        horario: texto(form, 'horario'),
        endereco: texto(form, 'endereco'),
        aberta: marcado(form, 'aberta'),
        fazEntrega: marcado(form, 'fazEntrega'),
        taxaEntrega: taxa,
        bairros: bairros.bairros,
        mesas: texto(form, 'mesas'),
        aceitaRetirada: marcado(form, 'aceitaRetirada'),
        aceitaAgendamento: marcado(form, 'aceitaAgendamento'),
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

// ---------- Garçons ----------

/** Usuário do garçom: letras minúsculas, números, _ e -. Vira "usuario.loja" para não repetir entre lojas. */
const USUARIO = /^[a-z0-9_-]{3,20}$/

export async function salvarGarcom(_: Estado, form: FormData): Promise<Estado> {
  const { payload, loja } = await sessao()
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
      data: { username: `${usuario}.${loja.slug}`, password: senha, nome, roles: ['garcom'], lojaDoGarcom: loja.id, ativo: true },
    })
  } catch (e) {
    return { erro: /unique|already|username/i.test(String(e)) ? 'Já existe um garçom com esse usuário.' : mensagem(e) }
  }
  redirect('/painel/garcons')
}

/** Só mexe em garçom desta loja: confere antes de gravar. */
async function mudarGarcom(id: number, data: { ativo: boolean } | { password: string }) {
  const { payload, loja } = await sessao()
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
