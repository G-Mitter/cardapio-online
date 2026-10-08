import { describe, expect, it } from 'vitest'

import { comCidade, linkMaps } from '@/lib/rota'

describe('rota de entrega', () => {
  it('junta a cidade da loja no endereço do cliente', () => {
    const loja = 'Rua dos Timbiras, 1200, Belo Horizonte'
    expect(comCidade('Rua A, 1, Centro', loja)).toBe('Rua A, 1, Centro, Belo Horizonte')
    expect(comCidade('Rua A, 1, Belo Horizonte', loja)).toBe('Rua A, 1, Belo Horizonte')
  })

  it('monta o link do Maps saindo e voltando para a loja', () => {
    const url = new URL(linkMaps('Loja, BH', ['A, BH', 'B, BH']))
    expect(url.origin + url.pathname).toBe('https://www.google.com/maps/dir/')
    expect(url.searchParams.get('origin')).toBe('Loja, BH')
    expect(url.searchParams.get('destination')).toBe('Loja, BH')
    expect(url.searchParams.get('waypoints')).toBe('A, BH|B, BH')
  })
})
