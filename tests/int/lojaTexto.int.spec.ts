import { describe, expect, it } from 'vitest'

import { lerEndereco, lerHorario, montarEndereco, montarHorario } from '@/lib/lojaTexto'

describe('horário da loja', () => {
  it('junta dias seguidos e escreve as horas', () => {
    expect(montarHorario({ dias: [0, 1, 2, 3, 4], abre: '11:00', fecha: '15:00' })).toBe('Seg a Sex: 11h às 15h')
    expect(montarHorario({ dias: [0, 2, 4, 6], abre: '18:30', fecha: '23:00' })).toBe('Seg, Qua, Sex e Dom: 18h30 às 23h')
    expect(montarHorario({ dias: [0, 1, 6], abre: '09:00', fecha: '12:00' })).toBe('Seg, Ter e Dom: 9h às 12h')
    expect(montarHorario({ dias: [0, 1, 2, 6], abre: '09:00', fecha: '12:00' })).toBe('Seg a Qua e Dom: 9h às 12h')
  })
  it('fica vazio sem dia ou sem hora', () => {
    expect(montarHorario({ dias: [], abre: '11:00', fecha: '15:00' })).toBe('')
    expect(montarHorario({ dias: [0], abre: '', fecha: '15:00' })).toBe('')
  })
  it('lê de volta o que montou', () => {
    for (const h of [
      { dias: [0, 1, 2, 3, 4], abre: '11:00', fecha: '15:00' },
      { dias: [0, 2, 4, 6], abre: '18:30', fecha: '23:45' },
      { dias: [0, 1, 2, 6], abre: '09:00', fecha: '12:00' },
    ]) {
      expect(lerHorario(montarHorario(h))).toEqual(h)
    }
  })
  it('texto antigo, digitado à mão, não é lido', () => {
    expect(lerHorario('12h as 16h')).toBeNull()
    expect(lerHorario('11h às 15h')).toBeNull()
  })
})

describe('endereço da loja', () => {
  it('junta só o que foi preenchido', () => {
    expect(montarEndereco({ rua: 'Rua A', numero: '10', bairro: 'Centro', cidade: 'BH' })).toBe('Rua A, 10, Centro, BH')
    expect(montarEndereco({ rua: 'Rua A', numero: '', bairro: '', cidade: 'BH' })).toBe('Rua A, BH')
  })
  it('lê de volta quatro partes; outro formato vai inteiro para a rua', () => {
    expect(lerEndereco('Rua A, 10, Centro, BH')).toEqual({ rua: 'Rua A', numero: '10', bairro: 'Centro', cidade: 'BH' })
    expect(lerEndereco('Rua dos Timbiras, 1200, Belo Horizonte')).toEqual({
      rua: 'Rua dos Timbiras, 1200, Belo Horizonte',
      numero: '',
      bairro: '',
      cidade: '',
    })
  })
})
