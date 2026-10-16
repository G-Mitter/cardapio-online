import { describe, expect, it } from 'vitest'

import { erroDoSlug, lerCnpj, lerDocumento, slugDoNome } from '@/lib/cadastro'

describe('lerCnpj', () => {
  it('aceita um CNPJ válido, com ou sem pontuação', () => {
    expect(lerCnpj('11.222.333/0001-81')).toBe('11222333000181')
    expect(lerCnpj('11222333000181')).toBe('11222333000181')
  })
  it('recusa dígito errado, tamanho errado e repetidos', () => {
    expect(lerCnpj('11.222.333/0001-82')).toBeNull()
    expect(lerCnpj('1122233300018')).toBeNull()
    expect(lerCnpj('00000000000000')).toBeNull()
    expect(lerCnpj(null)).toBeNull()
  })
})

describe('lerDocumento', () => {
  it('aceita CPF e CNPJ válidos', () => {
    expect(lerDocumento('529.982.247-25')).toBe('52998224725')
    expect(lerDocumento('11.222.333/0001-81')).toBe('11222333000181')
  })
  it('recusa o que não é nenhum dos dois', () => {
    expect(lerDocumento('123.456.789-00')).toBeNull()
    expect(lerDocumento('')).toBeNull()
  })
})

describe('slugDoNome', () => {
  it('tira acento e vira hífen', () => {
    expect(slugDoNome('Padaria São João!')).toBe('padaria-sao-joao')
  })
  it('limita o tamanho sem terminar em hífen', () => {
    const s = slugDoNome('a'.repeat(39) + ' bbb')
    expect(s.length).toBeLessThanOrEqual(40)
    expect(s.endsWith('-')).toBe(false)
  })
  it('nome sem letras dá vazio', () => {
    expect(slugDoNome('!!!')).toBe('')
  })
})

describe('erroDoSlug', () => {
  it('aceita um endereço comum', () => {
    expect(erroDoSlug('cantina-dona-lurdes')).toBeNull()
  })
  it('recusa formato ruim, curto e reservado', () => {
    expect(erroDoSlug('Cantina')).not.toBeNull()
    expect(erroDoSlug('ab')).not.toBeNull()
    expect(erroDoSlug('painel')).not.toBeNull()
    expect(erroDoSlug('admin')).not.toBeNull()
  })
})
