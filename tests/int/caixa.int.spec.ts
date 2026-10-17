import { describe, expect, it } from 'vitest'

import { diferenca, dinheiroEsperado, escolherCaixa, lerMovimento, nomeDoCaixa, rotuloDiferenca, vendasPorForma } from '@/lib/caixa'

describe('caixa do dia', () => {
  it('o esperado soma troco, vendas e suprimentos e tira as sangrias', () => {
    expect(dinheiroEsperado(100, 250.5, [{ tipo: 'sangria', valor: 80 }, { tipo: 'suprimento', valor: 20 }])).toBe(290.5)
    expect(dinheiroEsperado(0, 0, [])).toBe(0)
  })

  it('não erra nos centavos', () => {
    expect(dinheiroEsperado(0.1, 0.2, [])).toBe(0.3)
    expect(diferenca(0.3, 0.1 + 0.2)).toBe(0)
  })

  it('diferença negativa é falta e positiva é sobra', () => {
    expect(diferenca(280, 290.5)).toBe(-10.5)
    expect(rotuloDiferenca(-10.5)).toBe('Faltou')
    expect(rotuloDiferenca(5)).toBe('Sobrou')
    expect(rotuloDiferenca(0)).toBe('Caixa batendo')
  })

  it('só aceita os tipos de movimento que existem', () => {
    expect(lerMovimento('sangria')).toBe('sangria')
    expect(lerMovimento('roubo')).toBeUndefined()
  })

  it('junta pedidos e contas de mesa por forma de pagamento', () => {
    const v = vendasPorForma(
      [{ pagamento: 'dinheiro', total: 30 }, { pagamento: 'pix', total: 20 }, { total: 5 }],
      [{ pagamentos: [{ forma: 'dinheiro', valor: 45.9 }, { forma: 'cartao', valor: 10 }] }],
    )
    expect(v.get('dinheiro')).toBe(75.9)
    expect(v.get('pix')).toBe(20)
    expect(v.get('cartao')).toBe(10)
    expect(v.get('sem')).toBe(5)
  })

  it('o dinheiro do acerto do entregador entra em dinheiro', () => {
    const v = vendasPorForma([{ pagamento: 'dinheiro', total: 10 }], [], [{ entregue: 125.5 }, { entregue: 0.1 }])
    expect(v.get('dinheiro')).toBe(135.6)
  })

  it('escolhe o caixa da venda: o preferido que está aberto, senão o único aberto, senão nenhum', () => {
    const abertos = [{ id: 1 }, { id: 2 }]
    expect(escolherCaixa(abertos, [2, 1])).toBe(2)
    expect(escolherCaixa(abertos, [NaN, null, undefined, 9, 1])).toBe(1)
    expect(escolherCaixa(abertos, [9])).toBeNull()
    expect(escolherCaixa([{ id: 7 }], [9])).toBe(7)
    expect(escolherCaixa([], [1])).toBeNull()
  })

  it('o nome do caixa é o do cadastro; sem cadastro (caixa antigo) é "Caixa"', () => {
    expect(nomeDoCaixa({ id: 3, nome: '101' })).toBe('101')
    expect(nomeDoCaixa(3)).toBe('Caixa')
    expect(nomeDoCaixa(null)).toBe('Caixa')
  })
})
