import { describe, expect, it } from 'vitest'

import { primeirosPassos } from '@/lib/primeirosPassos'

const feitos = (...args: Parameters<typeof primeirosPassos>) => primeirosPassos(...args).map((p) => p.feito)

describe('primeirosPassos', () => {
  it('loja recém-criada: nada feito, menos a entrega (taxa 0 e sem bairros conta como a fazer)', () => {
    const loja = { fazEntrega: true, taxaEntrega: 0, bairros: [], formasPagamento: ['pix', 'cartao', 'dinheiro'] }
    expect(feitos(loja, 0)).toEqual([false, false, false, false, false])
  })
  it('endereço e horário só contam juntos', () => {
    expect(feitos({ endereco: 'Rua A, 1' }, 0)[0]).toBe(false)
    expect(feitos({ endereco: 'Rua A, 1', horario: '11h às 15h' }, 0)[0]).toBe(true)
  })
  it('entrega: sem entrega, com taxa ou com bairros já está feito', () => {
    expect(feitos({ fazEntrega: false }, 0)[2]).toBe(true)
    expect(feitos({ fazEntrega: true, taxaEntrega: 6 }, 0)[2]).toBe(true)
    expect(feitos({ fazEntrega: true, taxaEntrega: 0, bairros: [{}] }, 0)[2]).toBe(true)
  })
  it('Pix marcado pede a chave; sem Pix, basta ter outra forma', () => {
    expect(feitos({ formasPagamento: ['pix'] }, 0)[3]).toBe(false)
    expect(feitos({ formasPagamento: ['pix'], chavePix: 'a@b.com' }, 0)[3]).toBe(true)
    expect(feitos({ formasPagamento: ['dinheiro'] }, 0)[3]).toBe(true)
    expect(feitos({ formasPagamento: [] }, 0)[3]).toBe(false)
  })
  it('produtos: feito com pelo menos um', () => {
    expect(feitos({}, 0)[4]).toBe(false)
    expect(feitos({}, 1)[4]).toBe(true)
  })
})
