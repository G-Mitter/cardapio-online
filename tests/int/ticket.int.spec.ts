import { describe, expect, it } from 'vitest'

import { deveImprimir, lerLargura, lerVias, montarTickets } from '@/lib/ticket'

const item = (nome: string, setor: string) => ({ nome, quantidade: 1, opcoes: '', precoUnitario: 10, setor, embalagem: '' })

describe('ticket', () => {
  it('lê largura e vias com valores seguros', () => {
    expect(lerLargura('58')).toBe('58')
    expect(lerLargura('x')).toBe('80')
    expect([lerVias('2'), lerVias('0'), lerVias('9'), lerVias('abc'), lerVias(undefined)]).toEqual([2, 1, 3, 1, 1])
  })

  it('loja sem setores imprime um ticket completo', () => {
    const t = montarTickets([item('Pizza', 'Cozinha'), item('Suco', 'Cozinha')], [])
    expect(t).toHaveLength(1)
    expect(t[0]).toMatchObject({ setor: null, completo: true })
    expect(t[0].itens).toHaveLength(2)
  })

  it('com setores, um ticket por setor com item e só o primeiro é completo', () => {
    const itens = [item('Pizza', 'Cozinha'), item('Suco', 'Bar'), item('Antigo', 'Cozinha')]
    const t = montarTickets(itens, ['Bar', 'Cozinha', 'Sobremesas'])
    expect(t.map((x) => [x.setor, x.itens.map((i) => i.nome), x.completo])).toEqual([
      ['Bar', ['Suco'], true],
      ['Cozinha', ['Pizza', 'Antigo'], false],
    ])
    // Item de setor que não existe mais não se perde.
    expect(montarTickets([item('X', 'Extinto')], ['Bar', 'Cozinha'])[0]).toMatchObject({ setor: 'Bar', completo: true })
  })

  it('decide o que falta imprimir', () => {
    const c = { ligada: true, origens: ['site' as const, 'mesa' as const] }
    const base = { impresso: false, status: 'novo', origem: 'site' as const, agendadoPara: null }
    const agora = new Date('2026-10-16T12:00:00Z')
    expect(deveImprimir(base, c, agora)).toBe(true)
    expect(deveImprimir({ ...base, impresso: true }, c, agora)).toBe(false)
    expect(deveImprimir({ ...base, status: 'cancelado' }, c, agora)).toBe(false)
    expect(deveImprimir({ ...base, origem: 'balcao' }, c, agora)).toBe(false)
    expect(deveImprimir(base, { ...c, ligada: false }, agora)).toBe(false)
    expect(deveImprimir({ ...base, agendadoPara: '2026-10-17T12:00:00Z' }, c, agora)).toBe(false) // só perto da hora
    expect(deveImprimir({ ...base, agendadoPara: '2026-10-16T12:30:00Z' }, c, agora)).toBe(true)
  })
})
