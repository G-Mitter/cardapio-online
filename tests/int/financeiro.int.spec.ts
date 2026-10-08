import { describe, expect, it } from 'vitest'

import { alertas, intervaloDoMes, lerData, proximoVencimento, resumoDoMes, situacao } from '@/lib/financeiro'

describe('datas', () => {
  it('lerData recusa data que não existe', () => {
    expect(lerData('2026-02-28')).toBe('2026-02-28')
    expect(lerData('2026-02-30')).toBeNull()
    expect(lerData('28/02/2026')).toBeNull()
  })
  it('próximo vencimento cai no último dia do mês curto e volta ao dia certo', () => {
    expect(proximoVencimento('2026-01-31')).toBe('2026-02-28')
    expect(proximoVencimento('2026-02-28', 31)).toBe('2026-03-31')
    expect(proximoVencimento('2028-01-31')).toBe('2028-02-29')
    expect(proximoVencimento('2026-12-10')).toBe('2027-01-10')
  })
  it('intervalo do mês, em Brasília', () => {
    expect(intervaloDoMes('2026-10')).toEqual({
      mes: '2026-10',
      de: '2026-10-01T03:00:00.000Z',
      ate: '2026-11-01T03:00:00.000Z',
    })
    expect(intervaloDoMes('2026-12').ate).toBe('2027-01-01T03:00:00.000Z')
    expect(intervaloDoMes('lixo').mes).toMatch(/^\d{4}-\d{2}$/)
  })
})

describe('situação e alertas', () => {
  const hoje = '2026-10-08'
  it('classifica pelo dia', () => {
    expect(situacao('2026-10-07', hoje)).toBe('vencida')
    expect(situacao('2026-10-08', hoje)).toBe('hoje')
    expect(situacao('2026-10-15', hoje)).toBe('em7')
    expect(situacao('2026-10-16', hoje)).toBe('futura')
  })
  it('soma quantas e quanto', () => {
    const r = alertas(
      [
        { valor: 10.1, vencimento: '2026-10-01' },
        { valor: 20.2, vencimento: '2026-10-02' },
        { valor: 5, vencimento: '2026-10-08' },
        { valor: 7, vencimento: '2026-10-12' },
        { valor: 99, vencimento: '2026-12-01' },
      ],
      hoje,
    )
    expect(r).toEqual({
      vencidas: { n: 2, total: 30.3 },
      hoje: { n: 1, total: 5 },
      em7: { n: 1, total: 7 },
    })
  })
})

describe('resumo do mês', () => {
  it('vendas por forma + recebido − pago, sem a taxa de serviço', () => {
    const r = resumoDoMes(
      [
        { forma: 'pix', valor: 100.1 },
        { forma: 'cartao', valor: 200 },
        { forma: 'pix', valor: 50 },
      ],
      10,
      30,
      80.5,
    )
    expect(r.porForma).toEqual([
      { forma: 'pix', valor: 150.1 },
      { forma: 'cartao', valor: 200 },
    ])
    expect(r.vendas).toBe(340.1)
    expect(r.saldo).toBe(289.6)
  })
})
