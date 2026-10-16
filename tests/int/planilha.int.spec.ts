import { describe, expect, it } from 'vitest'

import { amostraParaIA, converterPlanilha, lerCsv, lerMapeamento, lerPreco, lerProdutos, paraCsv } from '@/lib/planilha'

describe('lerCsv', () => {
  it('entende o CSV do Excel em português (ponto e vírgula, aspas e BOM)', () => {
    const csv =
      '﻿nome;descricao;preco;categoria\r\n"Tropeiro; grande";"Feijão, ""da casa""";32,90;Pratos\r\n\r\n'
    expect(lerCsv(csv)).toEqual([
      ['nome', 'descricao', 'preco', 'categoria'],
      ['Tropeiro; grande', 'Feijão, "da casa"', '32,90', 'Pratos'],
    ])
  })

  it('entende o CSV com vírgula', () => {
    expect(lerCsv('nome,preco\nSuco,9.5')).toEqual([
      ['nome', 'preco'],
      ['Suco', '9.5'],
    ])
  })
})

describe('lerPreco', () => {
  it('aceita os jeitos comuns de escrever preço', () => {
    expect(lerPreco('32,90')).toBe(32.9)
    expect(lerPreco('R$ 1.234,50')).toBe(1234.5)
    expect(lerPreco('32.9')).toBe(32.9)
    expect(lerPreco('14')).toBe(14)
  })

  it('recusa o que não é preço', () => {
    expect(lerPreco('')).toBeNull()
    expect(lerPreco('abc')).toBeNull()
    expect(lerPreco('-5')).toBeNull()
    expect(lerPreco('3,999')).toBeNull()
  })
})

describe('lerProdutos', () => {
  it('lê colunas em qualquer ordem, com acento, e aponta as linhas com erro', () => {
    const r = lerProdutos([
      ['Categoria', 'Produto', 'Preço', 'Esgotado'],
      ['Bebidas', 'Suco de laranja', 9, ''],
      ['Bebidas', 'Refrigerante', '6,00', 'sim'],
      ['', 'Sem categoria', '5', ''],
      ['Bebidas', 'Água', 'grátis', ''],
      ['Bebidas', 'suco de laranja', '9', ''],
    ])
    expect(r.produtos).toEqual([
      {
        linha: 2,
        nome: 'Suco de laranja',
        descricao: '',
        preco: 9,
        categoria: 'Bebidas',
        esgotado: false,
      },
      {
        linha: 3,
        nome: 'Refrigerante',
        descricao: '',
        preco: 6,
        categoria: 'Bebidas',
        esgotado: true,
      },
    ])
    expect(r.erros.map((e) => e.linha)).toEqual([4, 5, 6])
  })

  it('avisa quando faltam colunas obrigatórias', () => {
    const r = lerProdutos([['nome', 'valor']])
    expect(r.produtos).toEqual([])
    expect(r.erros[0].motivo).toMatch(/Faltam as colunas: categoria/)
  })
})

describe('planilha de outro sistema', () => {
  const erp = [
    ['Relatório de produtos', '', '', '', ''],
    ['Cód', 'Descrição do item', 'Grupo', 'Preço venda', 'Saldo'],
    [1, 'Pizza grande', 'Pizzas', 'R$ 59,90', 4],
    [2, 'Suco 500 ml', '', 9, 0],
    ['', '', '', '', ''],
  ]
  const ia = { linha_cabecalho: 1, coluna_nome: 1, coluna_preco: 3, coluna_categoria: 2, coluna_estoque: 4 }

  it('valida o mapeamento da IA', () => {
    expect(lerMapeamento(ia, 5, 5)).toMatchObject({ cabecalho: 1, nome: 1, preco: 3, categoria: 2, descricao: null, estoque: 4 })
    expect(lerMapeamento({ ...ia, coluna_preco: 9 }, 5, 5)).toBeNull() // fora da planilha
    expect(lerMapeamento({ ...ia, coluna_preco: 1 }, 5, 5)).toBeNull() // coluna repetida
    expect(lerMapeamento({ coluna_nome: 1 }, 5, 5)).toBeNull()
  })

  it('converte para o padrão e o importador lê o resultado', () => {
    const m = lerMapeamento(ia, 5, 5)!
    const saida = converterPlanilha(erp, m)
    expect(saida).toEqual([
      ['nome', 'descricao', 'preco', 'categoria', 'esgotado'],
      ['Pizza grande', '', 'R$ 59,90', 'Pizzas', ''],
      ['Suco 500 ml', '', '9', 'Geral', 'sim'], // sem categoria vira Geral; saldo 0 vira esgotado
    ])
    const lido = lerProdutos(saida)
    expect(lido.erros).toEqual([])
    expect(lido.produtos.map((p) => [p.nome, p.preco, p.esgotado])).toEqual([['Pizza grande', 59.9, false], ['Suco 500 ml', 9, true]])
    expect(lerCsv(paraCsv(saida))).toEqual(saida)
  })

  it('manda à IA só a amostra, cortada', () => {
    const grande = Array.from({ length: 100 }, () => ['x'.repeat(200)])
    const a = amostraParaIA(grande)
    expect(a).toHaveLength(30)
    expect(a[0][0]).toHaveLength(60)
  })
})
