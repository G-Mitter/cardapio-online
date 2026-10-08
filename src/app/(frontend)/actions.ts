'use server'

/**
 * 'use server' transforma as funções deste arquivo em Server Actions:
 * o cardápio chama a função como se ela estivesse no navegador, mas ela
 * roda no servidor. Assim preço e total nunca dependem do que o navegador mandou.
 */
import { randomInt } from 'node:crypto'

import { getPayload, type Payload } from 'payload'

import {
  type FormaPagamento,
  type ItemEscolhido,
  lerCpf,
  type Modo,
  mensagemPedido,
  montarPedido,
} from '@/lib/pedido'
import { lerPreco } from '@/lib/planilha'
import { enderecoCompleto, normalizarTelefone } from '@/lib/cliente'
import { buscarCliente } from '@/lib/clientes-db'
import { lerMesas } from '@/lib/mesas'
import { lerAgendamento, rotuloAgendamento } from '@/lib/agendamento'
import { resumoDosItens } from '@/lib/carrinho'
import { type Cupom, normalizarCodigo } from '@/lib/cupom'
import { taxaDoBairro } from '@/lib/entrega'
import { type Escolhas, gruposDoProduto, resolverEscolhas } from '@/lib/opcoes'
import { whatsappUrl } from '@/lib/whatsapp'
import config from '@/payload.config'

export type DadosPedido = {
  loja: string
  itens: ItemEscolhido[]
  modo: Modo
  /** Cadastro do cliente (src/app/(frontend)/cliente-actions.ts). */
  telefone: string
  /** Id de um dos endereços do cadastro; só na entrega. */
  enderecoId?: string
  observacoes: string
  pagamento: FormaPagamento
  /** Só no dinheiro, e opcional: "troco para R$ 50". Vazio = não precisa de troco. */
  trocoPara?: string
  /** Só se o cliente marcou "CPF na nota". */
  cpf?: string
  /** Código do cupom que o cliente aplicou, se algum. */
  cupom?: string
  /** Só se o cliente agendou: "2026-10-10T19:30" (campo datetime-local). */
  agendarPara?: string
}

export type ResultadoPedido =
  | {
      ok: true
      numero: number
      /** Total do pedido, para os pixels de anúncios. */
      total: number
      mensagem: string
      link: string
      /** Só quando o cliente escolheu Pix e a loja tem chave: para ele copiar e pagar. */
      pix?: { chave: string; valor: number }
      /** Só na retirada: o cliente mostra este código ao buscar o pedido. */
      codigoRetirada?: string
    }
  | { ok: false; erro: string }

/** Teto de pedidos por hora em cada loja, para um robô não encher o banco. */
const MAX_POR_HORA = 60

const texto = (v: unknown, max: number) =>
  String(v ?? '')
    .trim()
    .slice(0, max)

async function buscarCupom(payload: Payload, loja: number, digitado: string): Promise<Cupom | null> {
  const codigo = normalizarCodigo(digitado)
  if (!codigo) return null
  const { docs } = await payload.find({
    collection: 'cupons',
    where: { loja: { equals: loja }, codigo: { equals: codigo } },
    limit: 1,
    depth: 0,
  })
  return docs[0] ?? null
}

export async function criarPedido(dados: DadosPedido): Promise<ResultadoPedido> {
  const telefone = normalizarTelefone(dados.telefone)
  const observacoes = texto(dados.observacoes, 300)
  const modo: Modo = dados.modo === 'retirada' ? 'retirada' : 'entrega'
  const itens = Array.isArray(dados.itens) ? dados.itens.slice(0, 100) : []

  if (!telefone) return { ok: false, erro: 'Coloque seu telefone.' }
  const cpfDigitado = texto(dados.cpf, 20)
  const cpf = cpfDigitado ? lerCpf(cpfDigitado) : null
  if (cpfDigitado && !cpf) return { ok: false, erro: 'CPF inválido. Confira os números.' }

  const payload = await getPayload({ config })
  // Nome e endereço vêm do cadastro, no servidor: o navegador só escolhe qual endereço.
  const cliente = await buscarCliente(payload, telefone)
  if (!cliente) return { ok: false, erro: 'Faça seu cadastro antes de enviar o pedido.' }
  const nome = cliente.nome
  const escolhido = cliente.enderecos?.find((e) => e.id === dados.enderecoId)
  const endereco = escolhido ? enderecoCompleto(escolhido) : ''
  if (modo === 'entrega' && !escolhido) return { ok: false, erro: 'Escolha o endereço de entrega.' }

  const { docs } = await payload.find({
    collection: 'lojas',
    where: { slug: { equals: texto(dados.loja, 100) } },
    limit: 1,
    depth: 0,
  })
  const loja = docs[0]
  if (!loja) return { ok: false, erro: 'Loja não encontrada.' }
  if (loja.aberta === false) return { ok: false, erro: 'A loja não está recebendo pedidos agora.' }
  if (modo === 'entrega' && loja.fazEntrega === false) {
    return { ok: false, erro: 'Esta loja não faz entrega. Escolha retirar.' }
  }
  if (modo === 'retirada' && loja.aceitaRetirada === false) {
    return { ok: false, erro: 'Esta loja não aceita retirada. Escolha entrega.' }
  }

  let agendadoPara: string | undefined
  if (dados.agendarPara) {
    if (!loja.aceitaAgendamento)
      return { ok: false, erro: 'Esta loja não aceita pedidos agendados.' }
    const a = lerAgendamento(dados.agendarPara)
    if (!a.ok) return a
    agendadoPara = a.quando
  }

  const pagamento = dados.pagamento
  if (!loja.formasPagamento?.includes(pagamento))
    return { ok: false, erro: 'Escolha a forma de pagamento.' }

  if (!whatsappUrl(loja.whatsapp))
    return { ok: false, erro: 'O WhatsApp da loja está incompleto no cadastro.' }

  const umaHoraAtras = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const recentes = await payload.count({
    collection: 'pedidos',
    where: { loja: { equals: loja.id }, createdAt: { greater_than: umaHoraAtras } },
    overrideAccess: true,
  })
  if (recentes.totalDocs >= MAX_POR_HORA) {
    return { ok: false, erro: 'Muitos pedidos agora. Chame a loja direto no WhatsApp.' }
  }

  const produtos = await payload.find({
    collection: 'produtos',
    where: {
      loja: { equals: loja.id },
      id: { in: itens.map((i) => i.produto) },
    },
    limit: 100,
    depth: 0,
  })
  const taxaEntrega =
    modo === 'entrega' && escolhido
      ? taxaDoBairro(loja.bairros, escolhido.bairro, loja.taxaEntrega ?? 0)
      : 0
  if (taxaEntrega === null) {
    return { ok: false, erro: 'A loja não entrega no bairro deste endereço. Escolha outro ou retire na loja.' }
  }
  const cupom = dados.cupom ? await buscarCupom(payload, loja.id, dados.cupom) : null
  if (dados.cupom && !cupom) return { ok: false, erro: 'Cupom não encontrado.' }
  const resultado = montarPedido(
    produtos.docs.map((p) => ({ ...p, opcoes: gruposDoProduto(p.opcoes) })),
    itens,
    taxaEntrega,
    modo,
    cupom,
  )
  if (!resultado.ok) return resultado
  const { pedido } = resultado

  const trocoDigitado = pagamento === 'dinheiro' ? texto(dados.trocoPara, 20) : ''
  const trocoPara = trocoDigitado ? lerPreco(trocoDigitado) : null
  if (trocoDigitado && (trocoPara === null || trocoPara < pedido.total)) {
    return { ok: false, erro: 'O troco precisa ser para um valor maior que o total.' }
  }

  // ponytail: número = total de pedidos da loja + 1; dois pedidos no mesmo instante podem repetir o número. Trocar por uma sequência no banco se virar problema.
  const total = await payload.count({
    collection: 'pedidos',
    where: { loja: { equals: loja.id } },
    overrideAccess: true,
  })
  const numero = total.totalDocs + 1
  const codigoRetirada =
    modo === 'retirada' ? String(randomInt(10_000)).padStart(4, '0') : undefined

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
      cupom: pedido.cupom,
      total: pedido.total,
      modo,
      nome,
      telefone,
      endereco: modo === 'entrega' ? endereco : '',
      agendadoPara,
      observacoes,
      pagamento,
      trocoPara,
      cpf,
      codigoRetirada,
    },
  })

  await payload.delete({
    collection: 'carrinhos',
    where: { loja: { equals: loja.id }, telefone: { equals: telefone } },
    overrideAccess: true,
  })

  if (cupom) {
    // ponytail: soma sem trava; dois pedidos no mesmo instante podem passar do limite de usos em 1.
    await payload.update({
      collection: 'cupons',
      where: { loja: { equals: loja.id }, codigo: { equals: cupom.codigo } },
      data: { usos: (cupom.usos ?? 0) + 1 },
      overrideAccess: true,
    })
  }

  const mensagem = mensagemPedido({
    loja: loja.nome,
    numero,
    pedido,
    modo,
    nome,
    endereco,
    observacoes,
    pagamento,
    trocoPara,
    cpf,
    codigoRetirada,
    agendadoPara: agendadoPara && rotuloAgendamento(agendadoPara),
  })
  const pix =
    pagamento === 'pix' && loja.chavePix ? { chave: loja.chavePix, valor: pedido.total } : undefined
  return {
    ok: true,
    numero,
    total: pedido.total,
    mensagem,
    link: whatsappUrl(loja.whatsapp, mensagem)!,
    pix,
    codigoRetirada,
  }
}

export type ResultadoMesa = { ok: true; numero: number; total: number } | { ok: false; erro: string }

/**
 * Pedido feito pelo QR Code da mesa: sem cadastro, sem endereço, sem taxa e sem pagamento no site
 * (paga no caixa). Nome e telefone são opcionais. Preço e total saem do banco, como em `criarPedido`.
 */
export async function criarPedidoMesa(dados: {
  loja: string
  mesa: string
  itens: ItemEscolhido[]
  nome: string
  telefone: string
  observacoes: string
}): Promise<ResultadoMesa> {
  const itens = Array.isArray(dados.itens) ? dados.itens.slice(0, 100) : []
  const telefoneDigitado = texto(dados.telefone, 20)
  const telefone = normalizarTelefone(telefoneDigitado)
  if (telefoneDigitado && !telefone) return { ok: false, erro: 'Telefone incompleto. Use DDD e número, ou deixe em branco.' }

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'lojas',
    where: { slug: { equals: texto(dados.loja, 100) } },
    limit: 1,
    depth: 0,
  })
  const loja = docs[0]
  if (!loja) return { ok: false, erro: 'Loja não encontrada.' }
  if (loja.aberta === false) return { ok: false, erro: 'A loja não está recebendo pedidos agora.' }
  const mesas = lerMesas(loja.mesas ?? '')
  const mesa = texto(dados.mesa, 30)
  if (!mesas.ok || !mesas.mesas.includes(mesa)) return { ok: false, erro: 'Mesa não encontrada. Leia o QR Code da mesa de novo.' }

  const umaHoraAtras = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const recentes = await payload.count({
    collection: 'pedidos',
    where: { loja: { equals: loja.id }, createdAt: { greater_than: umaHoraAtras } },
    overrideAccess: true,
  })
  if (recentes.totalDocs >= MAX_POR_HORA) return { ok: false, erro: 'Muitos pedidos agora. Chame alguém da casa.' }

  const produtos = await payload.find({
    collection: 'produtos',
    where: { loja: { equals: loja.id }, id: { in: itens.map((i) => i.produto) } },
    limit: 100,
    depth: 0,
  })
  const r = montarPedido(produtos.docs.map((p) => ({ ...p, opcoes: gruposDoProduto(p.opcoes) })), itens, 0, 'retirada')
  if (!r.ok) return r
  const { pedido } = r

  // ponytail: mesmo número do criarPedido (total de pedidos + 1), com a mesma chance de repetir em pedidos no mesmo instante.
  const total = await payload.count({ collection: 'pedidos', where: { loja: { equals: loja.id } }, overrideAccess: true })
  const numero = total.totalDocs + 1
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
      nome: texto(dados.nome, 100) || `Mesa ${mesa}`,
      telefone,
      observacoes: texto(dados.observacoes, 300),
    },
  })
  return { ok: true, numero, total: pedido.total }
}

export type ResultadoRepetir =
  | { ok: true; itens: { produto: number; quantidade: number; escolhas: Escolhas }[]; faltaram: string[] }
  | { ok: false; erro: string }

/**
 * "Repetir pedido": os itens do último pedido do telefone nesta loja, só os que ainda dá para
 * pedir (produto existe, não esgotou, opções continuam valendo). Não devolve endereço,
 * pagamento nem CPF, só o que vai para o carrinho.
 */
export async function repetirUltimoPedido(telefone: string, loja: string): Promise<ResultadoRepetir> {
  const tel = normalizarTelefone(telefone)
  if (!tel) return { ok: false, erro: 'Telefone incompleto.' }
  const payload = await getPayload({ config })
  const lojas = await payload.find({
    collection: 'lojas',
    where: { slug: { equals: texto(loja, 100) } },
    limit: 1,
    depth: 0,
  })
  if (!lojas.docs[0]) return { ok: false, erro: 'Loja não encontrada.' }
  const { docs } = await payload.find({
    collection: 'pedidos',
    where: {
      loja: { equals: lojas.docs[0].id },
      telefone: { equals: tel },
      status: { not_equals: 'cancelado' },
    },
    sort: '-createdAt',
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const ultimo = docs[0]
  if (!ultimo) return { ok: false, erro: 'Você ainda não fez pedidos nesta loja.' }

  const produtos = await payload.find({
    collection: 'produtos',
    where: {
      loja: { equals: lojas.docs[0].id },
      id: { in: (ultimo.itens ?? []).map((i) => i.produto).filter(Boolean) },
    },
    limit: 100,
    depth: 0,
  })
  const itens: { produto: number; quantidade: number; escolhas: Escolhas }[] = []
  const faltaram: string[] = []
  for (const i of ultimo.itens ?? []) {
    const p = produtos.docs.find((x) => x.id === i.produto)
    const escolhas = (i.escolhas ?? {}) as Escolhas
    const ok = p && !p.esgotado && resolverEscolhas(gruposDoProduto(p.opcoes), escolhas).ok
    if (ok) itens.push({ produto: p.id, quantidade: i.quantidade, escolhas })
    else faltaram.push(i.nome)
  }
  return { ok: true, itens, faltaram }
}

export type ResultadoCupom = { ok: true; codigo: string; desconto: number } | { ok: false; erro: string }

/** Mostra no carrinho quanto o cupom abate. Quem vale mesmo é a conferência dentro de `criarPedido`. */
export async function aplicarCupom(dados: {
  loja: string
  codigo: string
  itens: ItemEscolhido[]
}): Promise<ResultadoCupom> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'lojas',
    where: { slug: { equals: texto(dados.loja, 100) } },
    limit: 1,
    depth: 0,
  })
  const loja = docs[0]
  if (!loja) return { ok: false, erro: 'Loja não encontrada.' }
  const cupom = await buscarCupom(payload, loja.id, texto(dados.codigo, 40))
  if (!cupom) return { ok: false, erro: 'Cupom não encontrado.' }
  const itens = Array.isArray(dados.itens) ? dados.itens.slice(0, 100) : []
  const produtos = await payload.find({
    collection: 'produtos',
    where: { loja: { equals: loja.id }, id: { in: itens.map((i) => i.produto) } },
    limit: 100,
    depth: 0,
  })
  const r = montarPedido(
    produtos.docs.map((p) => ({ ...p, opcoes: gruposDoProduto(p.opcoes) })),
    itens,
    0,
    'retirada',
    cupom,
  )
  return r.ok ? { ok: true, codigo: cupom.codigo, desconto: r.pedido.desconto } : r
}

/**
 * Guarda o carrinho de quem já se identificou, para a loja chamar se o pedido não sair.
 * Carrinho vazio apaga o que estava guardado. Erros aqui não atrapalham o cliente: não devolve nada.
 */
export async function guardarCarrinho(dados: {
  loja: string
  telefone: string
  itens: ItemEscolhido[]
}): Promise<void> {
  const telefone = normalizarTelefone(dados.telefone)
  if (!telefone) return
  const payload = await getPayload({ config })
  const cliente = await buscarCliente(payload, telefone)
  if (!cliente) return
  const lojas = await payload.find({
    collection: 'lojas',
    where: { slug: { equals: texto(dados.loja, 100) } },
    limit: 1,
    depth: 0,
  })
  const loja = lojas.docs[0]
  if (!loja) return

  const onde = { loja: { equals: loja.id }, telefone: { equals: telefone } }
  const itens = Array.isArray(dados.itens) ? dados.itens.slice(0, 100) : []
  const produtos = await payload.find({
    collection: 'produtos',
    where: { loja: { equals: loja.id }, id: { in: itens.map((i) => i.produto) } },
    limit: 100,
    depth: 0,
  })
  const r = montarPedido(
    produtos.docs.map((p) => ({ ...p, opcoes: gruposDoProduto(p.opcoes) })),
    itens,
    0,
    'retirada',
  )
  if (!r.ok) {
    if (!itens.length) {
      await payload.delete({ collection: 'carrinhos', where: onde, overrideAccess: true })
    }
    return
  }
  const data = {
    nome: cliente.nome,
    resumo: resumoDosItens(r.pedido.itens),
    total: r.pedido.subtotal - r.pedido.promocao,
  }
  const existente = await payload.find({
    collection: 'carrinhos',
    where: onde,
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (existente.docs[0]) {
    await payload.update({
      collection: 'carrinhos',
      id: existente.docs[0].id,
      data,
      overrideAccess: true,
    })
  } else {
    await payload.create({
      collection: 'carrinhos',
      data: { ...data, loja: loja.id, telefone },
      overrideAccess: true,
    })
  }
}
