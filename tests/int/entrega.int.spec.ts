import { describe, expect, it } from 'vitest'

import { bairrosComoTexto, lerBairros, taxaDoBairro } from '@/lib/entrega'

const bairros = [
  { nome: 'Centro', taxa: 5 },
  { nome: 'Santa Efigênia', taxa: 8.5 },
]

describe('taxa por bairro', () => {
  it('acha o bairro sem ligar para acento, maiúscula ou espaço', () => {
    expect(taxaDoBairro(bairros, ' santa efigenia ', 6)).toBe(8.5)
    expect(taxaDoBairro(bairros, 'CENTRO', 6)).toBe(5)
  })

  it('bairro fora da lista não tem entrega', () => {
    expect(taxaDoBairro(bairros, 'Savassi', 6)).toBeNull()
  })

  it('sem bairros cadastrados vale a taxa única, em qualquer bairro', () => {
    expect(taxaDoBairro([], 'Savassi', 6)).toBe(6)
    expect(taxaDoBairro(undefined, 'Savassi', 0)).toBe(0)
  })
})

describe('texto do painel', () => {
  it('lê um bairro por linha e devolve o mesmo texto', () => {
    const r = lerBairros('Centro = 5,00\n\n Santa Efigênia = R$ 8,50 ')
    expect(r).toEqual({ ok: true, bairros })
    expect(bairrosComoTexto(bairros)).toBe('Centro = 5,00\nSanta Efigênia = 8,50')
  })

  it('recusa linha sem valor, valor inválido e bairro repetido', () => {
    expect(lerBairros('Centro').ok).toBe(false)
    expect(lerBairros('Centro = abc').ok).toBe(false)
    expect(lerBairros('Centro = 5\ncentro = 6').ok).toBe(false)
  })
})
