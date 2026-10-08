'use server'

/**
 * 'use server' transforma as funções deste arquivo em Server Actions:
 * o cardápio chama a função como se ela estivesse no navegador, mas ela
 * roda no servidor. Assim preço e total nunca dependem do que o navegador mandou.
 */
import { getPayload } from 'payload'

import { type ItemEscolhido, type Modo, mensagemPedido, montarPedido } from '@/lib/pedido'
import { enderecoCompleto, normalizarTelefone } from '@/lib/cliente'
import { buscarCliente } from '@/lib/clientes-db'
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
}

export type ResultadoPedido =
  | { ok: true; numero: number; mensagem: string; link: string }
  | { ok: false; erro: string }

/** Teto de pedidos por hora em cada loja, para um robô não encher o banco. */
const MAX_POR_HORA = 60

const texto = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)

export async function criarPedido(dados: DadosPedido): Promise<ResultadoPedido> {
  const telefone = normalizarTelefone(dados.telefone)
  const observacoes = texto(dados.observacoes, 300)
  const modo: Modo = dados.modo === 'retirada' ? 'retirada' : 'entrega'
  const itens = Array.isArray(dados.itens) ? dados.itens.slice(0, 100) : []

  if (!telefone) return { ok: false, erro: 'Coloque seu telefone.' }

  const payload = await getPayload({ config })
  // Nome e endereço vêm do cadastro, no servidor: o navegador só escolhe qual endereço.
  const cliente = await buscarCliente(payload, telefone)
  if (!cliente) return { ok: false, erro: 'Faça seu cadastro antes de enviar o pedido.' }
  const nome = cliente.nome
  const escolhido = cliente.enderecos?.find((e) => e.id === dados.enderecoId)
  const endereco = escolhido ? enderecoCompleto(escolhido) : ''
  if (modo === 'entrega' && !endereco) return { ok: false, erro: 'Escolha o endereço de entrega.' }

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

  if (!whatsappUrl(loja.whatsapp)) return { ok: false, erro: 'O WhatsApp da loja está incompleto no cadastro.' }

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
  const resultado = montarPedido(produtos.docs, itens, loja.taxaEntrega ?? 0, modo)
  if (!resultado.ok) return resultado
  const { pedido } = resultado

  // ponytail: número = total de pedidos da loja + 1; dois pedidos no mesmo instante podem repetir o número. Trocar por uma sequência no banco se virar problema.
  const total = await payload.count({
    collection: 'pedidos',
    where: { loja: { equals: loja.id } },
    overrideAccess: true,
  })
  const numero = total.totalDocs + 1

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
    },
  })

  const mensagem = mensagemPedido({ loja: loja.nome, numero, pedido, modo, nome, endereco, observacoes })
  return { ok: true, numero, mensagem, link: whatsappUrl(loja.whatsapp, mensagem)! }
}
