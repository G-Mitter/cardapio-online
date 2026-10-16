import type { Payload } from 'payload'

import { vendasPorForma } from './caixa'

/**
 * Vendas recebidas na loja entre duas datas, por forma de pagamento: pedidos entregues sem mesa
 * (menos entrega, que entra no acerto do entregador) e contas de mesa fechadas.
 */
export async function vendasDoPeriodo(payload: Payload, lojaId: number, de: string, ate: string) {
  const busca = { limit: 0, depth: 0, overrideAccess: true } as const
  const intervalo = { greater_than_equal: de, less_than: ate }
  const [pedidos, contas] = await Promise.all([
    payload.find({
      collection: 'pedidos',
      where: { loja: { equals: lojaId }, status: { equals: 'entregue' }, mesa: { exists: false }, modo: { not_equals: 'entrega' }, createdAt: intervalo },
      ...busca,
    }),
    payload.find({ collection: 'fechamentos', where: { loja: { equals: lojaId }, createdAt: intervalo }, ...busca }),
  ])
  return vendasPorForma(pedidos.docs, contas.docs)
}
