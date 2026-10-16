/**
 * Trocar a posição de um item com o vizinho. Recebe os ids na ordem atual e devolve a nova ordem,
 * ou null se não há para onde ir (já é o primeiro/último, ou o id não está na lista).
 */
export function mover(ids: number[], id: number, direcao: -1 | 1): number[] | null {
  const de = ids.indexOf(id)
  const para = de + direcao
  if (de < 0 || para < 0 || para >= ids.length) return null
  const novo = [...ids]
  ;[novo[de], novo[para]] = [novo[para], novo[de]]
  return novo
}
