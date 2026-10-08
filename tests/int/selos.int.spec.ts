import { describe, expect, it } from 'vitest'

import { lerSelos, rotulosDosSelos } from '@/lib/selos'

describe('selos', () => {
  it('ignora o que não é selo e mantém a ordem da lista', () => {
    expect(lerSelos(['promocao', 'x', 'novo', 'novo'])).toEqual(['novo', 'promocao'])
    expect(lerSelos([])).toEqual([])
  })

  it('devolve os rótulos para o cardápio', () => {
    expect(rotulosDosSelos(['promocao', 'mais-pedido'])).toEqual(['Mais pedido', 'Promoção'])
    expect(rotulosDosSelos(null)).toEqual([])
  })
})
