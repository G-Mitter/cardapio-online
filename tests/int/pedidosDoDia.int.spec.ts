import { describe, expect, it } from 'vitest'

import { avisoDeStatus, inicioDoDia, ordenar } from '@/lib/pedidosDoDia'

describe('inicioDoDia', () => {
  it('usa a meia-noite de Brasília, mesmo quando em UTC já é outro dia', () => {
    // 01:30 UTC do dia 7 ainda é 22:30 do dia 6 em Brasília.
    expect(inicioDoDia(new Date('2026-10-07T01:30:00Z'))).toBe('2026-10-06T03:00:00.000Z')
    expect(inicioDoDia(new Date('2026-10-06T15:00:00Z'))).toBe('2026-10-06T03:00:00.000Z')
  })
})

describe('ordenar', () => {
  it('coloca os pedidos em aberto primeiro e os mais antigos antes', () => {
    const p = (numero: number, status: 'novo' | 'pronto' | 'entregue', createdAt: string) => ({
      numero,
      status,
      createdAt,
    })
    const r = ordenar([
      p(1, 'entregue', '2026-10-06T12:00:00Z'),
      p(2, 'novo', '2026-10-06T13:10:00Z'),
      p(3, 'pronto', '2026-10-06T12:30:00Z'),
      p(4, 'novo', '2026-10-06T13:00:00Z'),
    ])
    expect(r.map((x) => x.numero)).toEqual([4, 2, 3, 1])
  })
})

describe('avisoDeStatus', () => {
  const base = { numero: 6, nome: 'Maria da Silva', loja: 'Cantina', modo: 'entrega' as const }

  it('diz ao cliente o novo status, com o número do pedido', () => {
    expect(avisoDeStatus({ ...base, status: 'pronto' })).toBe(
      'Olá, Maria! Seu pedido nº 6 na Cantina saiu para entrega',
    )
    expect(avisoDeStatus({ ...base, modo: 'retirada', status: 'pronto' })).toContain(
      'pronto para retirada',
    )
    expect(avisoDeStatus({ ...base, status: 'cancelado' })).toContain('foi cancelado')
  })

  it('não avisa pedido novo', () => {
    expect(avisoDeStatus({ ...base, status: 'novo' })).toBeNull()
  })
})
