import { describe, expect, it } from 'vitest'

import { enderecoCompleto, mascararEndereco, normalizarTelefone, primeiroNome } from '@/lib/cliente'

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

  it('quem digita um telefone conhecido vê só o primeiro nome e o endereço escondido', () => {
    expect(primeiroNome('  Maria   da Silva ')).toBe('Maria')
    expect(
      mascararEndereco({ rua: 'Rua dos Timbiras, 1200', complemento: 'ap 301', bairro: 'Centro' }),
    ).toBe('Rua dos Ti…, 1200')
    expect(mascararEndereco({ rua: 'Rua A, 5', bairro: 'Centro' })).toBe('Rua A, 5')
  })

  it('a loja recebe o endereço completo', () => {
    expect(enderecoCompleto({ rua: 'Rua A, 5', complemento: '', bairro: 'Centro' })).toBe(
      'Rua A, 5, Centro',
    )
  })
})
