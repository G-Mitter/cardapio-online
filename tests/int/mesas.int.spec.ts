import { describe, expect, it } from 'vitest'

import { agruparMesas, lerMesas } from '@/lib/mesas'

describe('lerMesas', () => {
  it('um número vira as mesas de 1 até ele', () => {
    expect(lerMesas('3')).toEqual({ ok: true, mesas: ['1', '2', '3'] })
  })
  it('aceita nomes separados por vírgula ou linha', () => {
    expect(lerMesas('Varanda 1, Varanda 2\nSalão')).toEqual({ ok: true, mesas: ['Varanda 1', 'Varanda 2', 'Salão'] })
  })
  it('vazio é loja sem mesas', () => {
    expect(lerMesas('  ')).toEqual({ ok: true, mesas: [] })
  })
  it('recusa quantidade fora do limite, nome repetido e nome comprido', () => {
    expect(lerMesas('0').ok).toBe(false)
    expect(lerMesas('101').ok).toBe(false)
    expect(lerMesas('Sala, sala').ok).toBe(false)
    expect(lerMesas('a'.repeat(31)).ok).toBe(false)
  })
})

describe('agruparMesas', () => {
  it('soma por mesa em centavos e ordena 2 antes de 10', () => {
    const p = (id: number, mesa: string, total: number) => ({ id, numero: id, mesa, total })
    const r = agruparMesas([p(1, '10', 0.1), p(2, '2', 20), p(3, '10', 0.2)])
    expect(r.map((c) => c.mesa)).toEqual(['2', '10'])
    expect(r[1].total).toBe(0.3)
    expect(r[1].pedidos).toHaveLength(2)
  })
})
