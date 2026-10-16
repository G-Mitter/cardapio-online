/**
 * Setores de preparo (Cozinha, Bar, Sobremesas...): cada categoria pertence a um, e a tela da cozinha
 * pode mostrar só os itens de um setor. Sem setor definido, a categoria é da Cozinha.
 */

export const SETOR_PADRAO = 'Cozinha'
export const SUGESTOES_SETOR = ['Cozinha', 'Bar', 'Sobremesas'] as const

/** Setor escrito na tela: sem espaço sobrando, até 30 letras; vazio vale como setor padrão. */
export const lerSetor = (v: unknown) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, 30) : '')

export const setorDaCategoria = (setor: string | null | undefined) => lerSetor(setor) || SETOR_PADRAO

const mesmo = (a: string, b: string) => a.localeCompare(b, 'pt', { sensitivity: 'base' }) === 0

/** Setores para as abas da cozinha. Só há abas se alguma categoria saiu do padrão. */
export function setoresDaLoja(categorias: { setor?: string | null }[]): string[] {
  const setores: string[] = []
  for (const c of categorias) {
    const s = setorDaCategoria(c.setor)
    if (!setores.some((x) => mesmo(x, s))) setores.push(s)
  }
  return setores.length > 1 ? setores.sort((a, b) => a.localeCompare(b, 'pt')) : []
}

type ComSetor = { setor: string }

/**
 * Pedidos só com os itens do setor, sem os pedidos que não têm nada nele. `setor` vazio ou desconhecido não filtra.
 * O status é do pedido inteiro: avançar num setor avança para todos.
 */
export function filtrarPorSetor<T extends { itens: ComSetor[] }>(pedidos: T[], setor: string, setores: string[]): T[] {
  const escolhido = setores.find((s) => mesmo(s, setor))
  if (!escolhido) return pedidos
  return pedidos.flatMap((p) => {
    const itens = p.itens.filter((i) => mesmo(i.setor, escolhido))
    return itens.length ? [{ ...p, itens }] : []
  })
}
