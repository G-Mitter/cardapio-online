import { describe, expect, it } from 'vitest'

import { entraAceito, origemDoPedido } from '@/lib/origem'

describe('origem do pedido', () => {
  it('sai dos campos de sempre quando ninguém disse', () => {
    expect(origemDoPedido({})).toBe('site')
    expect(origemDoPedido({ mesa: '5' })).toBe('mesa')
    expect(origemDoPedido({ mesa: '5', garcom: 7 })).toBe('garcom')
    expect(origemDoPedido({ balcao: true })).toBe('balcao')
  })

  it('respeita a origem dita por quem criou (iFood) e ignora valor desconhecido', () => {
    expect(origemDoPedido({ origem: 'ifood', mesa: '5' })).toBe('ifood')
    expect(origemDoPedido({ origem: 'xyz' })).toBe('site')
  })

  it('aceita sozinho só o que chega de fora e não é agendado', () => {
    expect(entraAceito('site', true, false)).toBe(true)
    expect(entraAceito('mesa', true, false)).toBe(true)
    expect(entraAceito('ifood', true, false)).toBe(true)
    expect(entraAceito('site', true, true)).toBe(false) // agendado
    expect(entraAceito('balcao', true, false)).toBe(false) // equipe lançou
    expect(entraAceito('garcom', true, false)).toBe(false)
    expect(entraAceito('site', false, false)).toBe(false) // loja não ligou
    expect(entraAceito('site', undefined, false)).toBe(false)
  })
})
