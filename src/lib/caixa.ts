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

/** Em qual caixa aberto vai uma venda: o pedido (se já tiver), o que a pessoa escolheu, ou o único aberto. */
export function escolherCaixa(abertos: { id: number }[], preferidos: (number | null | undefined)[]): number | null {
  const achado = preferidos.find((id) => abertos.some((c) => c.id === id))
  return achado ?? (abertos.length === 1 ? abertos[0].id : null)
}

/** Nome do caixa na tela: o cadastrado ("101"), ou "Caixa" nos de antes do cadastro. */
export const nomeDoCaixa = (cadastro: unknown) => (typeof cadastro === 'object' && cadastro && 'nome' in cadastro ? String(cadastro.nome) : 'Caixa')

/**
 * Soma das vendas por forma de pagamento, de pedidos (sem mesa) e de contas de mesa fechadas.
 * `acertos` é o dinheiro que os entregadores trouxeram: entra em "dinheiro".
 */
export function vendasPorForma(
  pedidos: { pagamento?: string | null; total: number }[],
  contas: { pagamentos?: { forma: string; valor: number }[] | null }[],
  acertos: { entregue: number }[] = [],
): Map<string, number> {
  const porForma = new Map<string, number>()
  const soma = (forma: string, valor: number) => porForma.set(forma, (porForma.get(forma) ?? 0) + c(valor))
  for (const p of pedidos) soma(p.pagamento ?? 'sem', p.total)
  for (const f of contas) for (const p of f.pagamentos ?? []) soma(p.forma, p.valor)
  for (const a of acertos) soma('dinheiro', a.entregue)
  return new Map([...porForma].map(([k, v]) => [k, v / 100]))
}
