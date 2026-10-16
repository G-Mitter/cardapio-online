import { describe, expect, it } from 'vitest'

import { consumo, custoDoPrato, faltaIngrediente, lerFicha, lerQuantidade, rotuloQuantidade, situacao, somar, textoDoCusto, variacaoDoPedido } from '@/lib/estoque'

describe('estoque', () => {
  it('lê quantidades de vários jeitos', () => {
    expect(lerQuantidade('10')).toBe(10)
    expect(lerQuantidade('2,5')).toBe(2.5)
    expect(lerQuantidade('0.250')).toBe(0.25)
    expect(lerQuantidade('1.250,5')).toBe(1250.5)
    expect(lerQuantidade('-2')).toBeNull()
    expect(lerQuantidade('-2', { negativo: true })).toBe(-2)
    expect(lerQuantidade('1,2345')).toBeNull()
    expect(lerQuantidade('abc')).toBeNull()
    expect(lerQuantidade('')).toBeNull()
  })

  it('soma sem sobra de ponto flutuante', () => {
    expect(somar(0.1, 0.2)).toBe(0.3)
    expect(somar(1, -2.5)).toBe(-1.5)
  })

  it('diz quando está acabando ou acabou', () => {
    expect(situacao(5, 2)).toBe('ok')
    expect(situacao(2, 2)).toBe('baixo')
    expect(situacao(0.5, 0)).toBe('ok') // sem mínimo definido, só avisa quando zera
    expect(situacao(0, 0)).toBe('acabou')
    expect(situacao(-3, 2)).toBe('acabou')
  })

  it('escreve a quantidade com vírgula', () => {
    expect(rotuloQuantidade(2.5, 'kg')).toBe('2,5 kg')
  })
})

describe('ficha técnica', () => {
  const fichas = new Map([
    [1, [{ ingrediente: 10, quantidade: 0.15 }, { ingrediente: 11, quantidade: 1 }]], // pizza: mussarela e massa
    [2, [{ ingrediente: 10, quantidade: 0.05 }]], // salada: mussarela
  ])

  it('lê a ficha do formulário e recusa o que está errado', () => {
    const ok = lerFicha('[{"ingrediente":10,"quantidade":"0,15"}]', [10, 11])
    expect(ok).toEqual({ ok: true, ficha: [{ ingrediente: 10, quantidade: 0.15 }] })
    expect(lerFicha('', [10])).toEqual({ ok: true, ficha: [] })
    expect(lerFicha('[{"ingrediente":99,"quantidade":"1"}]', [10]).ok).toBe(false) // de outra loja
    expect(lerFicha('[{"ingrediente":10,"quantidade":"0"}]', [10]).ok).toBe(false)
    expect(lerFicha('[{"ingrediente":10,"quantidade":"abc"}]', [10]).ok).toBe(false)
    expect(lerFicha('[{"ingrediente":10,"quantidade":"1"},{"ingrediente":10,"quantidade":"2"}]', [10]).ok).toBe(false)
    expect(lerFicha('{x', [10]).ok).toBe(false)
  })

  it('soma o que o pedido gasta e ignora produto sem ficha', () => {
    const c = consumo([{ produto: 1, quantidade: 2 }, { produto: 2, quantidade: 1 }, { produto: 3, quantidade: 5 }, { quantidade: 1 }], fichas)
    expect([...c]).toEqual([[10, 0.35], [11, 2]])
  })

  it('baixa ao criar, devolve ao cancelar e acerta a edição', () => {
    const pedido = consumo([{ produto: 1, quantidade: 2 }], fichas)
    const nada = new Map<number, number>()
    expect([...variacaoDoPedido(nada, pedido)]).toEqual([[10, -0.3], [11, -2]]) // criar
    expect([...variacaoDoPedido(pedido, nada)]).toEqual([[10, 0.3], [11, 2]]) // cancelar
    const maisUm = consumo([{ produto: 1, quantidade: 3 }], fichas)
    expect([...variacaoDoPedido(pedido, maisUm)]).toEqual([[10, -0.15], [11, -1]]) // editar
    expect(variacaoDoPedido(pedido, pedido).size).toBe(0) // só mudou o status
  })

  it('o prato pausa quando falta algum ingrediente', () => {
    const ficha = fichas.get(1)!
    expect(faltaIngrediente(ficha, new Map([[10, 1], [11, 5]]))).toBe(false)
    expect(faltaIngrediente(ficha, new Map([[10, 1], [11, 0]]))).toBe(true)
    expect(faltaIngrediente(ficha, new Map([[10, 1]]))).toBe(true) // ingrediente que não existe mais
  })
})

describe('custo e margem do prato', () => {
  const ficha = [{ ingrediente: 1, quantidade: 0.2 }, { ingrediente: 2, quantidade: 3 }]
  it('soma quantidade × custo e tira a margem sobre o preço', () => {
    const r = custoDoPrato(ficha, new Map([[1, 32], [2, 1.5]]), 30)
    expect(r).toEqual({ ok: true, custo: 10.9, margem: 19.1, margemPct: 63.7 })
  })
  it('não chuta quando falta o custo de algum ingrediente', () => {
    expect(custoDoPrato(ficha, new Map([[1, 32], [2, null]]), 30)).toEqual({ ok: false, faltam: [2] })
    expect(custoDoPrato(ficha, new Map([[1, 32]]), 30)).toEqual({ ok: false, faltam: [2] })
  })
  it('custo zero é um custo informado; sem ficha não calcula', () => {
    expect(custoDoPrato([{ ingrediente: 1, quantidade: 1 }], new Map([[1, 0]]), 10)).toMatchObject({ ok: true, custo: 0, margemPct: 100 })
    expect(custoDoPrato([], new Map(), 10)).toBeNull()
  })
  it('margem negativa e preço zero não quebram', () => {
    expect(custoDoPrato([{ ingrediente: 1, quantidade: 1 }], new Map([[1, 20]]), 15)).toMatchObject({ margem: -5, margemPct: -33.3 })
    expect(custoDoPrato([{ ingrediente: 1, quantidade: 1 }], new Map([[1, 20]]), 0)).toMatchObject({ margemPct: 0 })
  })
  it('escreve o resultado em português', () => {
    const nomes = new Map([[1, 'Mussarela'], [2, 'Molho']])
    expect(textoDoCusto({ ok: false, faltam: [1, 2] }, nomes)).toBe('falta o custo de Mussarela, Molho')
    expect(textoDoCusto({ ok: true, custo: 10.9, margem: 19.1, margemPct: 63.7 }, nomes)).toMatch(/custo R\$\s10,90 · margem R\$\s19,10 \(63,7%\)/)
  })
})
