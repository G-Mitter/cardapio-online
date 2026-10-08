import { describe, expect, it } from 'vitest'

import { lerPixelMeta, lerTagGoogle } from '@/lib/pixel'

describe('lerPixelMeta', () => {
  it('aceita números e vazio', () => {
    expect(lerPixelMeta(' 123456789012345 ')).toEqual({ ok: true, id: '123456789012345' })
    expect(lerPixelMeta('')).toEqual({ ok: true, id: '' })
  })
  it('recusa o que não é só número (nada entra no script)', () => {
    expect(lerPixelMeta("123');alert(1);//").ok).toBe(false)
    expect(lerPixelMeta('abc').ok).toBe(false)
    expect(lerPixelMeta('123').ok).toBe(false)
  })
})

describe('lerTagGoogle', () => {
  it('aceita G- e AW-, em qualquer caixa', () => {
    expect(lerTagGoogle('g-abc1234567')).toEqual({ ok: true, id: 'G-ABC1234567' })
    expect(lerTagGoogle('AW-1234567890')).toEqual({ ok: true, id: 'AW-1234567890' })
    expect(lerTagGoogle('')).toEqual({ ok: true, id: '' })
  })
  it('recusa outros formatos', () => {
    expect(lerTagGoogle("G-ABCD');x('").ok).toBe(false)
    expect(lerTagGoogle('UA-12345-1').ok).toBe(false)
  })
})
