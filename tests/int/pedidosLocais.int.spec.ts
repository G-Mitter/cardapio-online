import { describe, expect, it } from 'vitest'

import { comPedidoNovo, lerPedidosLocais, MAX_PEDIDOS_LOCAIS, type PedidoLocal } from '@/lib/pedidosLocais'

const pedido = (numero: number): PedidoLocal => ({
  numero,
  em: '2026-10-11T12:00:00.000Z',
  total: 50,
  modo: 'retirada',
  codigoRetirada: '1234',
  itens: [{ produto: 1, nome: 'Pizza', quantidade: 2, escolhas: {} }],
})

describe('Seus pedidos (no aparelho)', () => {
  it('guarda e lê de volta', () => {
    expect(lerPedidosLocais(JSON.stringify([pedido(1)]))).toEqual([pedido(1)])
  })

  it('lixo, vazio ou formato errado viram lista vazia', () => {
    expect(lerPedidosLocais(null)).toEqual([])
    expect(lerPedidosLocais('{{')).toEqual([])
    expect(lerPedidosLocais('{"a":1}')).toEqual([])
    expect(lerPedidosLocais(JSON.stringify([{ numero: 'x' }, pedido(2)]))).toEqual([pedido(2)])
  })

  it('o novo vai para o topo e só ficam os últimos', () => {
    let lista: PedidoLocal[] = []
    for (let n = 1; n <= MAX_PEDIDOS_LOCAIS + 2; n++) lista = comPedidoNovo(lista, pedido(n))
    expect(lista).toHaveLength(MAX_PEDIDOS_LOCAIS)
    expect(lista[0].numero).toBe(MAX_PEDIDOS_LOCAIS + 2)
  })

  it('mesmo número não duplica', () => {
    expect(comPedidoNovo([pedido(1)], pedido(1))).toHaveLength(1)
  })
})
