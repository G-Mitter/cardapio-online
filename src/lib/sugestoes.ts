/**
 * "Peça também": produtos que ainda não estão no pedido, de uma tela só (um toque, sem opções).
 * Começa pelas categorias que o cliente ainda não pediu (quem pede prato lembra da bebida)
 * e vai de categoria em categoria, um produto de cada vez, até completar `max`.
 */
type P = { id: number; esgotado: boolean; opcoes: unknown[] }
type C<T extends P> = { id: number; produtos: T[] }

export function sugerir<T extends P>(categorias: C<T>[], noPedido: number[], max = 3): T[] {
  const filas = categorias
    .map((c) => ({
      pediu: c.produtos.some((p) => noPedido.includes(p.id)),
      produtos: c.produtos.filter((p) => !noPedido.includes(p.id) && !p.esgotado && !p.opcoes.length),
    }))
    .filter((c) => c.produtos.length)
    // sort estável: dentro de cada grupo a ordem do cardápio se mantém.
    .sort((a, b) => Number(a.pediu) - Number(b.pediu))

  const saida: T[] = []
  for (let n = 0; saida.length < max && filas.some((f) => f.produtos[n]); n++) {
    for (const f of filas) if (f.produtos[n] && saida.length < max) saida.push(f.produtos[n])
  }
  return saida
}
