/**
 * "Compre mais e ganhe mais": leve N e pague M do mesmo produto (ex.: leve 3, pague 2).
 * A cada N unidades, as N-M mais baratas saem de graça; sobra de unidades não conta.
 * Sem banco e sem tela: o carrinho mostra a conta e o servidor refaz.
 */

export type Promocao = { leve: number; pague: number }

/** Regra gravada no produto, ou null se estiver vazia ou incoerente (pague tem que ser menos que leve). */
export function promocaoDoProduto(p: { leve?: number | null; pague?: number | null }): Promocao | null {
  const { leve, pague } = p
  if (!leve || !pague || !Number.isInteger(leve) || !Number.isInteger(pague)) return null
  return leve >= 2 && pague >= 1 && pague < leve ? { leve, pague } : null
}

export const rotuloPromocao = (p: Promocao) => `Leve ${p.leve}, pague ${p.pague}`

const centavos = (reais: number) => Math.round(reais * 100)

/** Quanto as promoções abatem (em reais) nestas linhas do pedido. */
export function descontoDePromocoes(
  linhas: { produto: number | string; precoUnitario: number; quantidade: number }[],
  regra: (produto: number | string) => Promocao | null,
): number {
  // Todas as unidades do produto juntas (mesmo em linhas com opções diferentes), cada uma com o seu preço.
  const porProduto = new Map<string, number[]>()
  for (const l of linhas) {
    const unidades = porProduto.get(String(l.produto)) ?? []
    for (let i = 0; i < l.quantidade; i++) unidades.push(centavos(l.precoUnitario))
    porProduto.set(String(l.produto), unidades)
  }
  let total = 0
  for (const [produto, unidades] of porProduto) {
    const r = regra(produto)
    if (!r) continue
    const gratis = Math.floor(unidades.length / r.leve) * (r.leve - r.pague)
    total += unidades.sort((a, b) => a - b).slice(0, gratis).reduce((s, c) => s + c, 0)
  }
  return total / 100
}
