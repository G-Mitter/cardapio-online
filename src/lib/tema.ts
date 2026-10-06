import type { CSSProperties } from 'react'

/**
 * Visual de cada loja. Tudo vem do cadastro da loja no /admin:
 * nada de cor ou fonte de cliente escrita no código.
 *
 * As fontes são uma lista fechada porque cada uma precisa ser carregada
 * no layout (next/font). Para oferecer uma fonte nova, adicione aqui e lá.
 */
export const FONTES = {
  classica: { label: 'Clássica (Fraunces)', css: 'var(--font-classica)' },
  moderna: { label: 'Moderna (Archivo)', css: 'var(--font-moderna)' },
  tradicional: { label: 'Tradicional (Bitter)', css: 'var(--font-tradicional)' },
  leve: { label: 'Leve (Outfit)', css: 'var(--font-leve)' },
} as const

export type Fonte = keyof typeof FONTES

export const COR_PADRAO = '#9a3b1e'

/** Aceita só cor no formato #rrggbb. Evita que um texto qualquer vá parar no CSS da página. */
export const corValida = (cor: string | null | undefined): cor is string =>
  /^#[0-9a-f]{6}$/i.test(cor ?? '')

export function temaDaLoja(loja: { corPrincipal?: string | null; fonte?: string | null }) {
  const fonte = FONTES[(loja.fonte as Fonte) ?? 'classica'] ?? FONTES.classica
  return {
    '--brand': corValida(loja.corPrincipal) ? loja.corPrincipal : COR_PADRAO,
    '--display': fonte.css,
  } as CSSProperties
}
