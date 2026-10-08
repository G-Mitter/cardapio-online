import { describe, expect, it } from 'vitest'

import { fecharPagamento, lerTaxaServico, resumoPorGarcom, totalDaConta, valorPorPessoa } from '@/lib/conta'

describe('taxa e total', () => {
  it('10% sobre o subtotal, em centavos', () => {
    expect(totalDaConta(45.9, 10, true)).toEqual({ taxaServico: 4.59, total: 50.49 })
  })
  it('sem cobrar ou com taxa desligada, a taxa é zero', () => {
    expect(totalDaConta(40, 10, false)).toEqual({ taxaServico: 0, total: 40 })
    expect(totalDaConta(40, 0, true).total).toBe(40)
  })
  it('lê a taxa do painel', () => {
    expect(lerTaxaServico('10')).toEqual({ ok: true, valor: 10 })
    expect(lerTaxaServico('')).toEqual({ ok: true, valor: 0 })
    expect(lerTaxaServico('10,5')).toEqual({ ok: true, valor: 10.5 })
    expect(lerTaxaServico('31').ok).toBe(false)
    expect(lerTaxaServico('abc').ok).toBe(false)
  })
})

describe('dividir', () => {
  it('arredonda para cima o centavo', () => {
    expect(valorPorPessoa(100, 3)).toBe(33.34)
    expect(valorPorPessoa(100, 4)).toBe(25)
    expect(valorPorPessoa(100, 1)).toBe(100)
  })
})

describe('fecharPagamento', () => {
  it('uma forma, valor exato', () => {
    expect(fecharPagamento(50, [{ forma: 'cartao', valor: 50 }])).toEqual({
      ok: true,
      troco: 0,
      pagamentos: [{ forma: 'cartao', valor: 50 }],
    })
  })
  it('duas formas: R$ 50 em dinheiro e o resto no cartão', () => {
    const r = fecharPagamento(80.5, [
      { forma: 'dinheiro', valor: 50 },
      { forma: 'cartao', valor: 30.5 },
    ])
    expect(r).toEqual({
      ok: true,
      troco: 0,
      pagamentos: [
        { forma: 'dinheiro', valor: 50 },
        { forma: 'cartao', valor: 30.5 },
      ],
    })
  })
  it('troco sai do dinheiro e o que fica soma o total', () => {
    expect(fecharPagamento(37.5, [{ forma: 'dinheiro', valor: 50 }])).toEqual({
      ok: true,
      troco: 12.5,
      pagamentos: [{ forma: 'dinheiro', valor: 37.5 }],
    })
  })
  it('recusa se falta valor ou se o troco não é de dinheiro', () => {
    expect(fecharPagamento(50, [{ forma: 'pix', valor: 49.99 }]).ok).toBe(false)
    expect(fecharPagamento(50, [{ forma: 'pix', valor: 60 }]).ok).toBe(false)
    expect(fecharPagamento(50, [{ forma: 'dinheiro', valor: -1 }]).ok).toBe(false)
  })
  it('troco só do dinheiro: cartão e Pix não passam do total', () => {
    expect(
      fecharPagamento(50, [
        { forma: 'cartao', valor: 40 },
        { forma: 'dinheiro', valor: 20 },
      ]),
    ).toEqual({
      ok: true,
      troco: 10,
      pagamentos: [
        { forma: 'cartao', valor: 40 },
        { forma: 'dinheiro', valor: 10 },
      ],
    })
    expect(fecharPagamento(50, [{ forma: 'cartao', valor: 60 }]).ok).toBe(false)
  })
})

describe('resumoPorGarcom', () => {
  it('conta mesas e soma em centavos, por nome', () => {
    const r = resumoPorGarcom([
      { garcom: 'Maria', subtotal: 10.1, taxaServico: 1.01 },
      { garcom: 'Ana', subtotal: 20, taxaServico: 2 },
      { garcom: 'Maria', subtotal: 10.2, taxaServico: 1.02 },
    ])
    expect(r).toEqual([
      { garcom: 'Ana', mesas: 1, vendido: 20, taxaServico: 2 },
      { garcom: 'Maria', mesas: 2, vendido: 20.3, taxaServico: 2.03 },
    ])
  })
})
