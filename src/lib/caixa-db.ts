import { cookies } from 'next/headers'
import type { Payload } from 'payload'

import { escolherCaixa, nomeDoCaixa, vendasPorForma } from './caixa'
import { COOKIE_CAIXA } from './painel'

const busca = { limit: 0, depth: 0, overrideAccess: true } as const

/** Os caixas abertos da loja, com o cadastro (nome, se é o do delivery) já carregado. */
export async function caixasAbertos(payload: Payload, lojaId: number) {
  const { docs } = await payload.find({
    collection: 'caixas',
    where: { loja: { equals: lojaId }, fechadoEm: { exists: false } },
    sort: 'abertoEm',
    limit: 0,
    depth: 1,
    overrideAccess: true,
  })
  return docs
}

/** Pedido recebido na loja e sem caixa: entregue, sem mesa e que não foi entrega (a entrega entra pelo acerto). */
const semCaixa = (lojaId: number, desde: string) => ({
  loja: { equals: lojaId },
  status: { equals: 'entregue' },
  mesa: { exists: false },
  modo: { not_equals: 'entrega' },
  caixa: { exists: false },
  createdAt: { greater_than_equal: desde },
})

/**
 * Vendas recebidas em um caixa, por forma de pagamento: pedidos entregues sem mesa (menos entrega),
 * contas de mesa fechadas e o dinheiro que os entregadores trouxeram no acerto.
 */
export async function vendasDoCaixa(payload: Payload, lojaId: number, caixaId: number) {
  const [pedidos, contas, acertos] = await Promise.all([
    payload.find({
      collection: 'pedidos',
      where: { loja: { equals: lojaId }, status: { equals: 'entregue' }, mesa: { exists: false }, modo: { not_equals: 'entrega' }, caixa: { equals: caixaId } },
      ...busca,
    }),
    payload.find({ collection: 'fechamentos', where: { loja: { equals: lojaId }, caixa: { equals: caixaId } }, ...busca }),
    payload.find({ collection: 'acertos', where: { loja: { equals: lojaId }, caixa: { equals: caixaId } }, ...busca }),
  ])
  return vendasPorForma(pedidos.docs, contas.docs, acertos.docs)
}

/** Quantas vendas ainda estão sem caixa desde que o caixa mais antigo abriu (só importa com vários abertos). */
export async function contarSemCaixa(payload: Payload, lojaId: number, desde: string) {
  const [pedidos, contas] = await Promise.all([
    payload.count({ collection: 'pedidos', where: semCaixa(lojaId, desde), overrideAccess: true }),
    payload.count({ collection: 'fechamentos', where: { loja: { equals: lojaId }, caixa: { exists: false }, createdAt: { greater_than_equal: desde } }, overrideAccess: true }),
  ])
  return pedidos.totalDocs + contas.totalDocs
}

/** Põe no caixa dado as vendas que estavam sem caixa desde a data. */
export async function atribuirSemCaixa(payload: Payload, lojaId: number, caixaId: number, desde: string) {
  await payload.update({ collection: 'pedidos', where: semCaixa(lojaId, desde), data: { caixa: caixaId }, overrideAccess: true })
  await payload.update({
    collection: 'fechamentos',
    where: { loja: { equals: lojaId }, caixa: { exists: false }, createdAt: { greater_than_equal: desde } },
    data: { caixa: caixaId },
    overrideAccess: true,
  })
}

/** Para a tela de fechar conta da mesa: os caixas abertos e qual vem marcado (o do aparelho, ou o único aberto). */
export async function caixasParaMesa(payload: Payload, lojaId: number) {
  const abertos = await caixasAbertos(payload, lojaId)
  const doAparelho = Number((await cookies()).get(COOKIE_CAIXA)?.value)
  return {
    caixas: abertos.map((c) => ({ id: c.id, nome: nomeDoCaixa(c.cadastro) })),
    caixaInicial: escolherCaixa(abertos, [doAparelho]),
  }
}
