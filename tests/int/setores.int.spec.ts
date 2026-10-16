import { describe, expect, it } from 'vitest'

import { filtrarPorSetor, lerSetor, setorDaCategoria, setoresDaLoja } from '@/lib/setores'

describe('setores', () => {
  it('categoria sem setor é da Cozinha', () => {
    expect(setorDaCategoria('')).toBe('Cozinha')
    expect(setorDaCategoria(null)).toBe('Cozinha')
    expect(setorDaCategoria('  Bar ')).toBe('Bar')
    expect(lerSetor('a'.repeat(50))).toHaveLength(30)
  })

  it('só há abas quando a loja usa mais de um setor', () => {
    expect(setoresDaLoja([{ setor: '' }, { setor: null }, {}])).toEqual([])
    expect(setoresDaLoja([{ setor: 'Cozinha' }, { setor: '' }])).toEqual([]) // tudo Cozinha
    expect(setoresDaLoja([{ setor: '' }, { setor: 'Bar' }, { setor: 'bar' }, { setor: 'Sobremesas' }])).toEqual(['Bar', 'Cozinha', 'Sobremesas'])
  })

  it('mostra só os itens do setor e esconde pedido que não tem nada nele', () => {
    const pedidos = [
      { id: 1, itens: [{ nome: 'Pizza', setor: 'Cozinha' }, { nome: 'Suco', setor: 'Bar' }] },
      { id: 2, itens: [{ nome: 'Pizza', setor: 'Cozinha' }] },
    ]
    const setores = ['Bar', 'Cozinha']
    expect(filtrarPorSetor(pedidos, 'bar', setores)).toEqual([{ id: 1, itens: [{ nome: 'Suco', setor: 'Bar' }] }])
    expect(filtrarPorSetor(pedidos, 'Cozinha', setores).map((p) => p.id)).toEqual([1, 2])
    expect(filtrarPorSetor(pedidos, '', setores)).toBe(pedidos) // Todos
    expect(filtrarPorSetor(pedidos, 'Outro', setores)).toBe(pedidos)
  })
})
