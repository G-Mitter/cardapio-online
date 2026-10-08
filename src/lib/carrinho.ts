/**
 * Carrinho abandonado: o cliente se identificou, montou o carrinho e não finalizou.
 * Sem banco e sem tela: dá para testar sozinho.
 */

import { primeiroNome } from './cliente'
import { brl, type ItemPedido } from './pedido'

/** Carrinho mexido há menos que isso ainda está sendo montado: não aparece como abandonado. */
export const PARADO_APOS_MINUTOS = 30
/** Depois disso o carrinho é apagado sozinho (privacidade). */
export const APAGAR_APOS_DIAS = 7

export const emMinutosAtras = (min: number, agora = new Date()) =>
  new Date(agora.getTime() - min * 60_000).toISOString()

/** "2x Pizza (Grande), 1x Suco" */
export const resumoDosItens = (itens: Pick<ItemPedido, 'nome' | 'quantidade' | 'opcoes'>[]) =>
  itens.map((i) => `${i.quantidade}x ${i.nome}${i.opcoes ? ` (${i.opcoes})` : ''}`).join(', ')

/** Mensagem que a loja manda para quem deixou o carrinho; abre pronta no WhatsApp. */
export function mensagemRecuperacao(c: {
  nome: string
  loja: string
  resumo: string
  total: number
}): string {
  return `Olá, ${primeiroNome(c.nome)}! Aqui é da ${c.loja}. Vimos que você deixou no carrinho: ${c.resumo} (${brl(c.total)}). Posso ajudar a finalizar o pedido?`
}
