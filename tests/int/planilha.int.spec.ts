import { describe, expect, it } from 'vitest'

import { lerCsv, lerPreco, lerProdutos } from '@/lib/planilha'

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
