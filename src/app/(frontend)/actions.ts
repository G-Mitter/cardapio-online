'use server'

/**
 * 'use server' transforma as funções deste arquivo em Server Actions:
 * o cardápio chama a função como se ela estivesse no navegador, mas ela
 * roda no servidor. Assim preço e total nunca dependem do que o navegador mandou.
 */
import { randomInt } from 'node:crypto'

import { getPayload } from 'payload'

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
import { taxaDoBairro } from '@/lib/entrega'
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
}

export type ResultadoPedido =
  | {
      ok: true
      numero: number
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
  const resultado = montarPedido(produtos.docs, itens, taxaEntrega, modo)
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
      itens: pedido.itens.map(({ nome, quantidade, precoUnitario }) => ({
        nome,
        quantidade,
        precoUnitario,
      })),
      subtotal: pedido.subtotal,
      taxa: pedido.taxa,
      total: pedido.total,
      modo,
      nome,
      telefone,
      endereco: modo === 'entrega' ? endereco : '',
      observacoes,
      pagamento,
      trocoPara,
      cpf,
      codigoRetirada,
    },
  })

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
  })
  const pix =
    pagamento === 'pix' && loja.chavePix ? { chave: loja.chavePix, valor: pedido.total } : undefined
  return {
    ok: true,
    numero,
    mensagem,
    link: whatsappUrl(loja.whatsapp, mensagem)!,
    pix,
    codigoRetirada,
  }
}
