import { describe, expect, it } from 'vitest'

import { MAX_DIAS, periodo, resumirVendas, somarPorForma } from '@/lib/relatorios'

describe('período do relatório', () => {
  it('sem datas, são os últimos 7 dias até hoje', () => {
    expect(periodo(undefined, undefined, '2026-10-16')).toMatchObject({ de: '2026-10-10', ate: '2026-10-16', cortado: false })
  })
  it('troca a ordem se vier invertido e ignora data inválida', () => {
    expect(periodo('2026-10-12', '2026-10-05', '2026-10-16')).toMatchObject({ de: '2026-10-05', ate: '2026-10-12' })
    expect(periodo('lixo', '2026-10-12', '2026-10-16')).toMatchObject({ de: '2026-10-06', ate: '2026-10-12' })
  })
  it('corta períodos longos e avisa', () => {
    const p = periodo('2025-01-01', '2026-10-16', '2026-10-16')
    expect(p.cortado).toBe(true)
    expect(p.de).toBe('2026-07-17')
    expect(MAX_DIAS).toBe(92)
  })
  it('vai do começo do primeiro dia ao fim do último, em Brasília', () => {
    const p = periodo('2026-10-15', '2026-10-16', '2026-10-16')
    expect(p.desdeISO).toBe('2026-10-15T03:00:00.000Z')
    expect(p.ateISO).toBe('2026-10-17T03:00:00.000Z')
  })
})

describe('resumo de vendas', () => {
  const pedidos = [
    { createdAt: '2026-10-15T15:00:00.000Z', total: 50, itens: [{ nome: 'Pizza', quantidade: 1, precoUnitario: 40 }, { nome: 'Suco', quantidade: 2, precoUnitario: 5 }] },
    { createdAt: '2026-10-16T01:30:00.000Z', total: 40.1, itens: [{ nome: 'Pizza', quantidade: 1, precoUnitario: 40.1 }] },
    { createdAt: '2026-10-16T18:00:00.000Z', total: 10, itens: [{ nome: 'Suco', quantidade: 2, precoUnitario: 5 }] },
  ]
  it('soma, tira o ticket médio e agrupa por dia de Brasília', () => {
    const r = resumirVendas(pedidos)
    expect(r.pedidos).toBe(3)
    expect(r.total).toBe(100.1)
    expect(r.ticketMedio).toBe(33.37)
    // 01:30 UTC do dia 16 ainda é noite do dia 15 em Brasília
    expect(r.porDia).toEqual([
      { dia: '2026-10-15', pedidos: 2, total: 90.1 },
      { dia: '2026-10-16', pedidos: 1, total: 10 },
    ])
  })
  it('lista os mais vendidos, desempatando pelo faturamento', () => {
    expect(resumirVendas(pedidos).produtos).toEqual([
      { nome: 'Suco', quantidade: 4, total: 20 },
      { nome: 'Pizza', quantidade: 2, total: 80.1 },
    ])
  })
  it('sem pedidos não divide por zero', () => {
    expect(resumirVendas([])).toMatchObject({ pedidos: 0, total: 0, ticketMedio: 0, porDia: [], produtos: [] })
  })
})

describe('por forma de pagamento', () => {
  it('soma por forma, do maior para o menor, sem erro de centavos', () => {
    expect(somarPorForma([{ forma: 'pix', valor: 0.1 }, { forma: 'cartao', valor: 30 }, { forma: 'pix', valor: 0.2 }])).toEqual([
      { forma: 'cartao', valor: 30 },
      { forma: 'pix', valor: 0.3 },
    ])
  })
})
