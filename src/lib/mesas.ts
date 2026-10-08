/**
 * Mesas da loja e contas abertas, sem banco e sem tela: dá para testar sozinhas.
 */

export const MAX_MESAS = 100

/**
 * Texto do painel vira a lista de mesas: um número ("10" = mesas 1 a 10) ou nomes
 * separados por vírgula ou linha ("Varanda 1, Varanda 2"). Vazio = loja sem mesas.
 */
export function lerMesas(texto: string): { ok: true; mesas: string[] } | { ok: false; erro: string } {
  const t = texto.trim()
  if (/^\d+$/.test(t)) {
    const n = Number(t)
    if (n < 1 || n > MAX_MESAS) return { ok: false, erro: `Use de 1 a ${MAX_MESAS} mesas.` }
    return { ok: true, mesas: Array.from({ length: n }, (_, i) => String(i + 1)) }
  }
  const mesas: string[] = []
  for (const nome of t.split(/[\n,;]/).map((m) => m.trim()).filter(Boolean)) {
    if (nome.length > 30) return { ok: false, erro: `O nome "${nome}" tem mais de 30 letras.` }
    if (mesas.some((m) => m.toLowerCase() === nome.toLowerCase())) {
      return { ok: false, erro: `A mesa ${nome} aparece duas vezes.` }
    }
    mesas.push(nome)
  }
  if (mesas.length > MAX_MESAS) return { ok: false, erro: `Use no máximo ${MAX_MESAS} mesas.` }
  return { ok: true, mesas }
}

export type PedidoDeMesa = { id: number; numero: number; mesa: string; total: number }

/** Contas abertas: os pedidos de cada mesa e a soma. Mesas em ordem natural (2 antes de 10). */
export function agruparMesas<T extends PedidoDeMesa>(pedidos: T[]): { mesa: string; pedidos: T[]; total: number }[] {
  const porMesa = new Map<string, T[]>()
  for (const p of pedidos) porMesa.set(p.mesa, [...(porMesa.get(p.mesa) ?? []), p])
  return [...porMesa]
    .sort(([a], [b]) => a.localeCompare(b, 'pt-BR', { numeric: true }))
    .map(([mesa, lista]) => ({
      mesa,
      pedidos: lista,
      // Em centavos para não errar o arredondamento da soma.
      total: lista.reduce((s, p) => s + Math.round(p.total * 100), 0) / 100,
    }))
}
