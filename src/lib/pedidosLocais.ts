import type { Escolhas } from '@/lib/opcoes'

/** Pedido guardado no próprio aparelho do cliente (não vai para o servidor). */
export type PedidoLocal = {
  numero: number
  /** ISO. */
  em: string
  total: number
  modo: 'entrega' | 'retirada'
  codigoRetirada?: string
  itens: { produto: number; nome: string; quantidade: number; escolhas: Escolhas }[]
}

export const MAX_PEDIDOS_LOCAIS = 5

const ehNumero = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

function valido(p: unknown): p is PedidoLocal {
  const x = p as PedidoLocal
  return (
    !!x &&
    ehNumero(x.numero) &&
    ehNumero(x.total) &&
    typeof x.em === 'string' &&
    (x.modo === 'entrega' || x.modo === 'retirada') &&
    Array.isArray(x.itens) &&
    x.itens.every(
      (i) => ehNumero(i?.produto) && ehNumero(i.quantidade) && typeof i.nome === 'string' && !!i.escolhas,
    )
  )
}

/** Lê o texto guardado; dado estragado ou de outra versão vira lista vazia. */
export function lerPedidosLocais(bruto: string | null): PedidoLocal[] {
  try {
    const lista = JSON.parse(bruto ?? '[]')
    return Array.isArray(lista) ? lista.filter(valido).slice(0, MAX_PEDIDOS_LOCAIS) : []
  } catch {
    return []
  }
}

/** O pedido novo vai para o topo; passou de MAX_PEDIDOS_LOCAIS, o mais antigo sai. */
export const comPedidoNovo = (lista: PedidoLocal[], novo: PedidoLocal) =>
  [novo, ...lista.filter((p) => p.numero !== novo.numero)].slice(0, MAX_PEDIDOS_LOCAIS)
