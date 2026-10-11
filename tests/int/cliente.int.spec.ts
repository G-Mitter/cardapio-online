import { describe, expect, it } from 'vitest'

import { enderecoCompleto, normalizarTelefone, primeiroNome } from '@/lib/cliente'

describe('cadastro do cliente', () => {
  it('qualquer jeito de digitar o telefone vira a mesma chave', () => {
    for (const t of ['(31) 99999-0000', '+55 31 99999-0000', '5531999990000', '31999990000']) {
      expect(normalizarTelefone(t)).toBe('31999990000')
    }
    expect(normalizarTelefone('(31) 3333-0000')).toBe('3133330000')
  })

  it('recusa telefone sem DDD ou com dígitos a mais', () => {
    expect(normalizarTelefone('99999-0000')).toBeNull()
    expect(normalizarTelefone('319999900001')).toBeNull()
    expect(normalizarTelefone('')).toBeNull()
  })

  it('primeiro nome ignora sobrenome e espaços a mais', () => {
    expect(primeiroNome('  Maria   da Silva ')).toBe('Maria')
  })

  it('a loja recebe o endereço completo', () => {
    expect(enderecoCompleto({ rua: 'Rua A, 5', complemento: '', bairro: 'Centro' })).toBe(
      'Rua A, 5, Centro',
    )
  })
})
