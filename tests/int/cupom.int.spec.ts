import { describe, expect, it } from 'vitest'

import { type Cupom, descontoDoCupom, diaDoFim, fimDoDia, normalizarCodigo } from '@/lib/cupom'

const base: Cupom = { codigo: 'VERAO10', tipo: 'porcentagem', valor: 10 }

describe('cupom', () => {
  it('porcentagem e valor fixo, sem passar do subtotal', () => {
    expect(descontoDoCupom(base, 80)).toEqual({ ok: true, desconto: 8 })
    expect(descontoDoCupom({ ...base, tipo: 'valor', valor: 5 }, 80)).toEqual({ ok: true, desconto: 5 })
    expect(descontoDoCupom({ ...base, tipo: 'valor', valor: 50 }, 30)).toEqual({ ok: true, desconto: 30 })
    expect(descontoDoCupom({ ...base, valor: 33.3 }, 10)).toEqual({ ok: true, desconto: 3.33 })
  })

  it('recusa cupom desligado, vencido, esgotado ou com pedido abaixo do mínimo', () => {
    expect(descontoDoCupom({ ...base, ativo: false }, 80).ok).toBe(false)
    expect(descontoDoCupom({ ...base, validoAte: fimDoDia('2026-10-07') }, 80, new Date('2026-10-08T12:00:00Z')).ok).toBe(false)
    expect(descontoDoCupom({ ...base, limiteUso: 3, usos: 3 }, 80).ok).toBe(false)
    expect(descontoDoCupom({ ...base, minimo: 50 }, 49.9).ok).toBe(false)
  })

  it('vale durante todo o último dia, no horário de Brasília', () => {
    const c = { ...base, validoAte: fimDoDia('2026-10-08') }
    expect(descontoDoCupom(c, 80, new Date('2026-10-09T01:30:00Z')).ok).toBe(true) // 22h30 do dia 8
    expect(descontoDoCupom(c, 80, new Date('2026-10-09T03:30:00Z')).ok).toBe(false) // 0h30 do dia 9
    expect(diaDoFim(c.validoAte)).toBe('2026-10-08')
  })

  it('o código digitado vira o guardado', () => {
    expect(normalizarCodigo(' verao 10 ')).toBe('VERAO10')
    expect(normalizarCodigo('verão-10')).toBe('VERAO-10')
  })
})
