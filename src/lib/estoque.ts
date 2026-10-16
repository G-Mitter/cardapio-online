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

// ---------- Ficha técnica: quanto de cada ingrediente leva uma unidade do prato ----------

export type LinhaFicha = { ingrediente: number; quantidade: number }
export type ItemConsumo = { produto?: number | null; quantidade: number }

/**
 * Ficha vinda do formulário: JSON `[{ingrediente, quantidade}]`. Ingrediente de fora da loja, repetido
 * ou quantidade inválida/zero invalida tudo, com a mensagem para mostrar.
 */
export function lerFicha(json: string, ingredientesDaLoja: number[]): { ok: true; ficha: LinhaFicha[] } | { ok: false; erro: string } {
  let cru: unknown
  try {
    cru = json ? JSON.parse(json) : []
  } catch {
    return { ok: false, erro: 'A ficha técnica veio em formato inválido. Recarregue a página.' }
  }
  if (!Array.isArray(cru) || cru.length > 50) return { ok: false, erro: 'A ficha técnica veio em formato inválido. Recarregue a página.' }
  const ficha: LinhaFicha[] = []
  for (const l of cru as Record<string, unknown>[]) {
    const ingrediente = Number(l?.ingrediente)
    const quantidade = typeof l?.quantidade === 'string' ? lerQuantidade(l.quantidade) : null
    if (!ingredientesDaLoja.includes(ingrediente)) return { ok: false, erro: 'Escolha o ingrediente em todas as linhas da ficha técnica.' }
    if (!quantidade) return { ok: false, erro: 'Na ficha técnica, coloque a quantidade de cada ingrediente (maior que zero, por exemplo 0,15).' }
    if (ficha.some((f) => f.ingrediente === ingrediente)) return { ok: false, erro: 'Um ingrediente aparece duas vezes na ficha técnica.' }
    ficha.push({ ingrediente, quantidade })
  }
  return { ok: true, ficha }
}

/** O que os itens de um pedido gastam, por ingrediente. Produto sem ficha não gasta nada. */
export function consumo(itens: ItemConsumo[], fichas: Map<number, LinhaFicha[]>): Map<number, number> {
  const total = new Map<number, number>()
  for (const item of itens) {
    for (const l of (item.produto != null && fichas.get(item.produto)) || []) {
      total.set(l.ingrediente, somar(total.get(l.ingrediente) ?? 0, l.quantidade * item.quantidade))
    }
  }
  return total
}

/**
 * Quanto sai do estoque (valor negativo) ou volta (positivo) quando o pedido muda de `antes` para `depois`.
 * Pedido cancelado não gasta; criar é de nada para algo, apagar é de algo para nada.
 */
export function variacaoDoPedido(antes: Map<number, number>, depois: Map<number, number>): Map<number, number> {
  const v = new Map<number, number>()
  for (const id of new Set([...antes.keys(), ...depois.keys()])) {
    const d = somar(antes.get(id) ?? 0, -(depois.get(id) ?? 0))
    if (d !== 0) v.set(id, d)
  }
  return v
}

/** Falta algum ingrediente (zero ou menos) para fazer o prato? */
export const faltaIngrediente = (ficha: LinhaFicha[], quantidades: Map<number, number>) =>
  ficha.some((l) => (quantidades.get(l.ingrediente) ?? 0) <= 0)

// ---------- Custo e margem do prato ----------

export type CustoDoPrato = { ok: true; custo: number; margem: number; margemPct: number } | { ok: false; faltam: number[] }

/**
 * Custo de uma unidade do prato (quantidade × custo de cada ingrediente da ficha) e a margem sobre o preço.
 * Se algum ingrediente está sem custo, não chuta: devolve quais faltam. Sem ficha, não há o que calcular.
 */
export function custoDoPrato(ficha: LinhaFicha[], custos: Map<number, number | null | undefined>, preco: number): CustoDoPrato | null {
  if (!ficha.length) return null
  const faltam = ficha.filter((l) => custos.get(l.ingrediente) == null).map((l) => l.ingrediente)
  if (faltam.length) return { ok: false, faltam }
  const custo = Math.round(ficha.reduce((s, l) => s + l.quantidade * (custos.get(l.ingrediente) ?? 0), 0) * 100) / 100
  const margem = Math.round((preco - custo) * 100) / 100
  return { ok: true, custo, margem, margemPct: preco > 0 ? Math.round((margem / preco) * 1000) / 10 : 0 }
}

/** Ficha como o Payload devolve (ingrediente pode vir como número ou objeto, conforme a profundidade). */
export const lerFichaSalva = (ficha: { ingrediente: number | { id: number }; quantidade: number }[] | null | undefined): LinhaFicha[] =>
  (ficha ?? []).map((l) => ({ ingrediente: typeof l.ingrediente === 'object' ? l.ingrediente.id : l.ingrediente, quantidade: l.quantidade }))

const reais = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/** "custo R$ 12,40 · margem R$ 17,60 (58,7%)", ou o que falta para calcular. */
export function textoDoCusto(r: CustoDoPrato, nomes: Map<number, string>): string {
  if (!r.ok) return `falta o custo de ${r.faltam.map((id) => nomes.get(id) ?? 'ingrediente').join(', ')}`
  return `custo ${reais(r.custo)} · margem ${reais(r.margem)} (${String(r.margemPct).replace('.', ',')}%)`
}
