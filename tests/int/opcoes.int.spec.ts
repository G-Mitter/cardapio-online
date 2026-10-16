import { describe, expect, it } from 'vitest'

import { gruposDoProduto, lerOpcoes, lerOpcoesDaTela, resolverEscolhas } from '@/lib/opcoes'

const texto = 'Tamanho: obrigatório\n- Média\n- Grande = 8,00\nExtras: até 2\n- Bacon = 4,00\n- Queijo = 3,50\n- Ovo = 2'

const grupos = () => {
  const r = lerOpcoes(texto)
  if (!r.ok) throw new Error(r.erro)
  // Os ids que o banco daria: g0/i0...
  return gruposDoProduto(
    r.grupos.map((g, n) => ({ ...g, id: `g${n}`, itens: g.itens.map((i, m) => ({ ...i, id: `g${n}i${m}` })) })),
  )
}

describe('texto do painel', () => {
  it('lê grupos, regras e itens', () => {
    const r = lerOpcoes(texto)
    expect(r.ok && r.grupos).toMatchObject([
      { nome: 'Tamanho', min: 1, max: 1, itens: [{ nome: 'Média', preco: 0 }, { nome: 'Grande', preco: 8 }] },
      { nome: 'Extras', min: 0, max: 2, itens: [{ nome: 'Bacon', preco: 4 }, { nome: 'Queijo', preco: 3.5 }, { nome: 'Ovo', preco: 2 }] },
    ])
  })

  it('recusa item solto, grupo vazio, regra desconhecida e preço inválido', () => {
    expect(lerOpcoes('- Grande').ok).toBe(false)
    expect(lerOpcoes('Tamanho').ok).toBe(false)
    expect(lerOpcoes('Tamanho: grátis\n- A').ok).toBe(false)
    expect(lerOpcoes('Tamanho\n- A = abc').ok).toBe(false)
  })

  it('o máximo nunca passa da quantidade de itens', () => {
    const r = lerOpcoes('Extras: até 5\n- A\n- B')
    expect(r.ok && r.grupos[0].max).toBe(2)
  })
})

describe('escolhas do cliente', () => {
  it('soma os adicionais e descreve a escolha', () => {
    expect(resolverEscolhas(grupos(), { g0: ['g0i1'], g1: ['g1i0', 'g1i1'] })).toEqual({
      ok: true,
      adicional: 15.5,
      descricao: 'Grande, Bacon, Queijo',
    })
  })

  it('exige grupo obrigatório e respeita o máximo', () => {
    expect(resolverEscolhas(grupos(), {}).ok).toBe(false)
    expect(resolverEscolhas(grupos(), { g0: ['g0i0'], g1: ['g1i0', 'g1i1', 'g1i2'] }).ok).toBe(false)
  })

  it('recusa item repetido, de outro grupo ou que não existe', () => {
    expect(resolverEscolhas(grupos(), { g0: ['g0i0'], g1: ['g1i0', 'g1i0'] }).ok).toBe(false)
    expect(resolverEscolhas(grupos(), { g0: ['g1i0'] }).ok).toBe(false)
    expect(resolverEscolhas(grupos(), { g0: ['g0i0'], g9: ['x'] }).ok).toBe(false)
  })
})

describe('opções da tela do painel', () => {
  const grupo = { nome: 'Extras', obrigatorio: false, max: 5, itens: [{ nome: 'Bacon', preco: 4 }, { nome: 'Ovo', preco: 2.504 }] }

  it('lê o JSON, limita o máximo aos itens e arredonda o valor', () => {
    const r = lerOpcoesDaTela(JSON.stringify([{ ...grupo, obrigatorio: true }]))
    expect(r.ok && r.grupos).toEqual([
      { nome: 'Extras', min: 1, max: 2, itens: [{ nome: 'Bacon', preco: 4 }, { nome: 'Ovo', preco: 2.5 }] },
    ])
  })

  it('vazio é sem opções', () => {
    expect(lerOpcoesDaTela('')).toEqual({ ok: true, grupos: [] })
    expect(lerOpcoesDaTela('[]')).toEqual({ ok: true, grupos: [] })
  })

  it('recusa lixo, nome vazio, grupo sem itens, valor negativo e máximo zero', () => {
    for (const ruim of [
      'não é json',
      '{}',
      JSON.stringify([{ ...grupo, nome: ' ' }]),
      JSON.stringify([{ ...grupo, itens: [] }]),
      JSON.stringify([{ ...grupo, itens: [{ nome: 'A', preco: -1 }] }]),
      JSON.stringify([{ ...grupo, itens: [{ nome: '', preco: 1 }] }]),
      JSON.stringify([{ ...grupo, max: 0 }]),
    ]) {
      expect(lerOpcoesDaTela(ruim).ok).toBe(false)
    }
  })
})
