/** Etiquetas que a loja põe nos produtos. Lista fixa: dá visual igual em todas as lojas. */
export const SELOS = [
  { value: 'mais-pedido', label: 'Mais pedido' },
  { value: 'novo', label: 'Novo' },
  { value: 'promocao', label: 'Promoção' },
  { value: 'vegano', label: 'Vegano' },
  { value: 'picante', label: 'Picante' },
] as const
export type Selo = (typeof SELOS)[number]['value']

/** Só os selos que existem, na ordem da lista (o que vem do formulário não é de confiança). */
export const lerSelos = (valores: unknown[]): Selo[] =>
  SELOS.map((s) => s.value).filter((v) => valores.includes(v))

/** Rótulos para mostrar no cardápio. */
export const rotulosDosSelos = (valores: readonly string[] | null | undefined): string[] =>
  SELOS.filter((s) => valores?.includes(s.value)).map((s) => s.label)
