/**
 * Estoque no banco: baixa pelos pedidos e pausa automática dos pratos. Só servidor.
 * Nada aqui pode derrubar um pedido: o estoque avisa, nunca barra.
 */
import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

import { consumo, faltaIngrediente, type ItemConsumo, type LinhaFicha, variacaoDoPedido } from '@/lib/estoque'

type PedidoEstoque = { loja?: unknown; status?: string | null; itens?: ({ produto?: number | null; quantidade?: number | null } | null)[] | null }

const idDe = (v: unknown) => (typeof v === 'object' && v ? (v as { id: number }).id : (v as number | null | undefined))

/** Itens que contam para o estoque: pedido cancelado não gasta. */
const itensAtivos = (p: PedidoEstoque | null | undefined): ItemConsumo[] =>
  !p || p.status === 'cancelado' ? [] : (p.itens ?? []).flatMap((i) => (i?.quantidade ? [{ produto: i.produto, quantidade: i.quantidade }] : []))

/** Fichas dos produtos da loja que aparecem nestes itens. */
async function fichasDe(payload: Payload, lojaId: number, ids: number[]) {
  const fichas = new Map<number, LinhaFicha[]>()
  if (!ids.length) return fichas
  const { docs } = await payload.find({ collection: 'produtos', where: { loja: { equals: lojaId }, id: { in: ids } }, limit: 0, depth: 0, overrideAccess: true })
  for (const p of docs) {
    const ficha = (p.ficha ?? []).flatMap((l) => (idDe(l.ingrediente) ? [{ ingrediente: idDe(l.ingrediente)!, quantidade: l.quantidade }] : []))
    if (ficha.length) fichas.set(p.id, ficha)
  }
  return fichas
}

/**
 * Pedido criado, mudado ou apagado: tira ou devolve ao estoque a diferença e refaz a pausa dos pratos.
 * A conta usa a ficha de agora, então mudar a ficha entre o pedido e o cancelamento devolve um pouco diferente do que saiu.
 */
export async function acertarEstoque(payload: Payload, antes: PedidoEstoque | null | undefined, depois: PedidoEstoque | null | undefined) {
  try {
    const lojaId = idDe((depois ?? antes)?.loja)
    const itensAntes = itensAtivos(antes)
    const itensDepois = itensAtivos(depois)
    if (!lojaId || (!itensAntes.length && !itensDepois.length)) return
    const ids = [...new Set([...itensAntes, ...itensDepois].flatMap((i) => (i.produto ? [i.produto] : [])))]
    const fichas = await fichasDe(payload, lojaId, ids)
    const variacao = variacaoDoPedido(consumo(itensAntes, fichas), consumo(itensDepois, fichas))
    if (!variacao.size) return
    for (const [ingrediente, delta] of variacao) {
      // Soma no próprio banco: dois pedidos no mesmo instante não se atropelam.
      await payload.db.drizzle.execute(sql`UPDATE "ingredientes" SET "quantidade" = "quantidade" + ${delta} WHERE "id" = ${ingrediente} AND "loja_id" = ${lojaId}`)
    }
    await refazerPausa(payload, lojaId, [...variacao.keys()])
  } catch (e) {
    payload.logger.error({ err: e }, 'Estoque: não consegui acertar o estoque deste pedido')
  }
}

/**
 * Pausa o prato quando falta um ingrediente da ficha e volta quando todos estão repostos. Só mexe no que
 * a própria pausa automática marcou (`esgotadoAuto`): o que a loja esgotou à mão continua esgotado.
 */
export async function refazerPausa(payload: Payload, lojaId: number, ingredientes: number[]) {
  if (!ingredientes.length) return
  const produtos = await payload.find({ collection: 'produtos', where: { loja: { equals: lojaId }, 'ficha.ingrediente': { in: ingredientes } }, limit: 0, depth: 0, overrideAccess: true })
  await pausarPelaFicha(payload, lojaId, produtos.docs)
}

type ProdutoFicha = { id: number; esgotado?: boolean | null; esgotadoAuto?: boolean | null; ficha?: { ingrediente: unknown; quantidade: number }[] | null }

/** Refaz a pausa destes produtos, olhando o estoque de todos os ingredientes das fichas deles. */
export async function pausarPelaFicha(payload: Payload, lojaId: number, produtos: ProdutoFicha[]) {
  const fichas = produtos.map((p) => ({ p, ficha: (p.ficha ?? []).flatMap((l) => (idDe(l.ingrediente) ? [{ ingrediente: idDe(l.ingrediente)!, quantidade: l.quantidade }] : [])) }))
  const usados = [...new Set(fichas.flatMap((f) => f.ficha.map((l) => l.ingrediente)))]
  const { docs } = usados.length
    ? await payload.find({ collection: 'ingredientes', where: { loja: { equals: lojaId }, id: { in: usados } }, limit: 0, depth: 0, overrideAccess: true })
    : { docs: [] }
  const quantidades = new Map(docs.map((i) => [i.id, i.quantidade]))
  for (const { p, ficha } of fichas) {
    const falta = ficha.length > 0 && faltaIngrediente(ficha, quantidades)
    if (falta && !p.esgotado) await payload.update({ collection: 'produtos', id: p.id, data: { esgotado: true, esgotadoAuto: true }, overrideAccess: true })
    else if (!falta && p.esgotadoAuto) await payload.update({ collection: 'produtos', id: p.id, data: { esgotado: false, esgotadoAuto: false }, overrideAccess: true })
  }
}
