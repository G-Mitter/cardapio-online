/**
 * Caixa do dia, sem banco e sem tela: dá para testar sozinho.
 * Valores em reais, somados em centavos. Só o dinheiro entra na conta da gaveta;
 * Pix e cartão aparecem à parte, só para informar.
 */

export const MOVIMENTOS = [
  { value: 'sangria', label: 'Sangria (tirou dinheiro)', sinal: -1 },
  { value: 'suprimento', label: 'Suprimento (pôs dinheiro)', sinal: 1 },
] as const
export type Movimento = (typeof MOVIMENTOS)[number]['value']

const c = (v: number) => Math.round(v * 100)

export const lerMovimento = (v: unknown): Movimento | undefined => MOVIMENTOS.find((m) => m.value === v)?.value

/** Dinheiro que deveria estar na gaveta: troco inicial, mais vendas em dinheiro e suprimentos, menos sangrias. */
export function dinheiroEsperado(
  trocoInicial: number,
  vendasDinheiro: number,
  movimentos: { tipo: Movimento; valor: number }[],
): number {
  const mov = movimentos.reduce((s, m) => s + c(m.valor) * (MOVIMENTOS.find((x) => x.value === m.tipo)?.sinal ?? 0), 0)
  return (c(trocoInicial) + c(vendasDinheiro) + mov) / 100
}

/** Contado menos esperado: negativo é falta, positivo é sobra. */
export const diferenca = (contado: number, esperado: number) => (c(contado) - c(esperado)) / 100

export const rotuloDiferenca = (d: number) => (d === 0 ? 'Caixa batendo' : d < 0 ? 'Faltou' : 'Sobrou')

/** Soma das vendas por forma de pagamento, de pedidos (sem mesa) e de contas de mesa fechadas. */
export function vendasPorForma(
  pedidos: { pagamento?: string | null; total: number }[],
  contas: { pagamentos?: { forma: string; valor: number }[] | null }[],
): Map<string, number> {
  const porForma = new Map<string, number>()
  const soma = (forma: string, valor: number) => porForma.set(forma, (porForma.get(forma) ?? 0) + c(valor))
  for (const p of pedidos) soma(p.pagamento ?? 'sem', p.total)
  for (const f of contas) for (const p of f.pagamentos ?? []) soma(p.forma, p.valor)
  return new Map([...porForma].map(([k, v]) => [k, v / 100]))
}
