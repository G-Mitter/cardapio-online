/** Estoque de ingredientes, sem banco e sem tela: dá para testar sozinho. */

export const UNIDADES = [
  { valor: 'un', rotulo: 'unidade' },
  { valor: 'g', rotulo: 'grama (g)' },
  { valor: 'kg', rotulo: 'quilo (kg)' },
  { valor: 'ml', rotulo: 'mililitro (ml)' },
  { valor: 'l', rotulo: 'litro (l)' },
] as const

export type Unidade = (typeof UNIDADES)[number]['valor']

export const lerUnidade = (v: unknown): Unidade => UNIDADES.find((u) => u.valor === v)?.valor ?? 'un'

/** Quantidades com até 3 casas (1,5 · 0.250 · -2). Com vírgula e ponto juntos, o ponto é milhar ("1.250,5"). */
export function lerQuantidade(valor: string, { negativo = false } = {}): number | null {
  let v = valor.replace(/\s/g, '')
  if (v.includes(',')) v = v.replace(/\./g, '').replace(',', '.')
  if (!(negativo ? /^-?\d+(\.\d{1,3})?$/ : /^\d+(\.\d{1,3})?$/).test(v)) return null
  return Number(v)
}

/** Soma sem sobra de ponto flutuante (0,1 + 0,2 → 0,3). */
export const somar = (a: number, b: number) => Math.round((a + b) * 1000) / 1000

export type Situacao = 'ok' | 'baixo' | 'acabou'

/** `acabou`: zero ou menos. `baixo`: chegou ao mínimo que a loja definiu. */
export const situacao = (quantidade: number, minimo: number): Situacao =>
  quantidade <= 0 ? 'acabou' : minimo > 0 && quantidade <= minimo ? 'baixo' : 'ok'

/** "1,5 kg", "12 un". */
export const rotuloQuantidade = (q: number, unidade: string) =>
  `${String(q).replace('.', ',')} ${unidade}`
