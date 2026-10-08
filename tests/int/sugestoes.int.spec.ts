import { describe, expect, it } from 'vitest'

import { sugerir } from '@/lib/sugestoes'

const p = (id: number, extra = {}) => ({ id, esgotado: false, opcoes: [], ...extra })
const cardapio = [
  { id: 1, produtos: [p(1), p(2), p(3)] }, // pratos
  { id: 2, produtos: [p(4), p(5)] }, // bebidas
  { id: 3, produtos: [p(6, { esgotado: true }), p(7, { opcoes: [{}] })] }, // sobremesas, nenhuma serve
]

describe('Peça também', () => {
  it('quem pediu prato recebe sugestão de bebida primeiro', () => {
    expect(sugerir(cardapio, [1]).map((x) => x.id)).toEqual([4, 2, 5])
  })

  it('não repete o que já está no pedido nem sugere esgotado ou produto com opções', () => {
    const ids = sugerir(cardapio, [1, 4], 10).map((x) => x.id)
    expect(ids).toEqual([2, 5, 3])
  })

  it('carrinho vazio ou cardápio sem sobra devolve só o que existe', () => {
    expect(sugerir(cardapio, [], 2)).toHaveLength(2)
    expect(sugerir(cardapio, [1, 2, 3, 4, 5])).toEqual([])
  })
})
