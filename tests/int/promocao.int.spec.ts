import { describe, expect, it } from 'vitest'

import { descontoDePromocoes, promocaoDoProduto, rotuloPromocao } from '@/lib/promocao'

const regra = (id: number | string) => (String(id) === '1' ? { leve: 3, pague: 2 } : null)

describe('compre mais e ganhe mais', () => {
  it('a cada N unidades, as mais baratas saem de graça', () => {
    expect(descontoDePromocoes([{ produto: 1, precoUnitario: 10, quantidade: 3 }], regra)).toBe(10)
    expect(descontoDePromocoes([{ produto: 1, precoUnitario: 10, quantidade: 5 }], regra)).toBe(10)
    expect(descontoDePromocoes([{ produto: 1, precoUnitario: 10, quantidade: 6 }], regra)).toBe(20)
    expect(descontoDePromocoes([{ produto: 1, precoUnitario: 10, quantidade: 2 }], regra)).toBe(0)
  })

  it('junta linhas do mesmo produto e dá de graça a mais barata', () => {
    const linhas = [
      { produto: 1, precoUnitario: 12, quantidade: 1 }, // com adicional
      { produto: '1', precoUnitario: 10, quantidade: 2 },
      { produto: 2, precoUnitario: 99, quantidade: 3 }, // sem promoção
    ]
    expect(descontoDePromocoes(linhas, regra)).toBe(10)
  })

  it('só vale regra coerente', () => {
    expect(promocaoDoProduto({ leve: 3, pague: 2 })).toEqual({ leve: 3, pague: 2 })
    expect(promocaoDoProduto({ leve: 3, pague: 3 })).toBeNull()
    expect(promocaoDoProduto({ leve: 3 })).toBeNull()
    expect(promocaoDoProduto({ leve: 1, pague: 1 })).toBeNull()
    expect(rotuloPromocao({ leve: 3, pague: 2 })).toBe('Leve 3, pague 2')
  })
})
