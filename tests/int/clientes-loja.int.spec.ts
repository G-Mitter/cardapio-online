import { describe, expect, it } from 'vitest'

import { agruparClientes, diasSemPedir, filtrarClientes, lerInteiro } from '@/lib/clientes-loja'

const ped = (telefone: string | null, total: number, createdAt: string, nome = 'Ana', status = 'entregue') => ({ nome, telefone, total, status, createdAt })

describe('clientes da loja', () => {
  const lista = agruparClientes([
    ped('(31) 99999-0000', 30.1, '2026-09-01T12:00:00Z', 'Ana'),
    ped('31999990000', 20.2, '2026-10-01T12:00:00Z', 'Ana Maria'),
    ped('31999990000', 99, '2026-10-02T12:00:00Z', 'Ana', 'cancelado'),
    ped(null, 10, '2026-10-03T12:00:00Z', 'Mesa 3'),
    ped('11988887777', 50, '2026-10-10T12:00:00Z', 'Bruno'),
  ])

  it('junta pelo telefone, ignora cancelado e sem telefone, mais recente primeiro', () => {
    expect(lista).toEqual([
      { telefone: '11988887777', nome: 'Bruno', pedidos: 1, total: 50, ultimo: '2026-10-10T12:00:00Z' },
      { telefone: '31999990000', nome: 'Ana Maria', pedidos: 2, total: 50.3, ultimo: '2026-10-01T12:00:00Z' },
    ])
  })

  it('filtra por busca, por tempo sem pedir e por número de pedidos', () => {
    const agora = new Date('2026-10-16T12:00:00Z')
    expect(diasSemPedir('2026-10-01T12:00:00Z', agora)).toBe(15)
    expect(filtrarClientes(lista, { busca: 'maria' }, agora).map((x) => x.nome)).toEqual(['Ana Maria'])
    expect(filtrarClientes(lista, { busca: '9888' }, agora).map((x) => x.nome)).toEqual(['Bruno'])
    expect(filtrarClientes(lista, { semPedirHa: 10 }, agora).map((x) => x.nome)).toEqual(['Ana Maria'])
    expect(filtrarClientes(lista, { minimoDePedidos: 2 }, agora).map((x) => x.nome)).toEqual(['Ana Maria'])
    expect(filtrarClientes(lista, {}, agora)).toHaveLength(2)
  })

  it('só aceita inteiro positivo na URL', () => {
    expect([lerInteiro('30'), lerInteiro('0'), lerInteiro('-1'), lerInteiro('x'), lerInteiro('1.5'), lerInteiro(undefined)]).toEqual([30, undefined, undefined, undefined, undefined, undefined])
  })
})
