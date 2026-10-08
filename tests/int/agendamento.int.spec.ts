import { describe, expect, it } from 'vitest'

import { lerAgendamento, limitesDoCampo, rotuloAgendamento } from '@/lib/agendamento'

// 10/10/2026 12:00 em Brasília
const agora = new Date('2026-10-10T15:00:00Z')

describe('lerAgendamento', () => {
  it('aceita horário dentro da janela e converte de Brasília para UTC', () => {
    expect(lerAgendamento('2026-10-10T19:30', agora)).toEqual({
      ok: true,
      quando: '2026-10-10T22:30:00.000Z',
    })
  })
  it('recusa menos de 1 hora de antecedência', () => {
    expect(lerAgendamento('2026-10-10T12:30', agora).ok).toBe(false)
  })
  it('recusa mais de 7 dias à frente', () => {
    expect(lerAgendamento('2026-10-18T12:00', agora).ok).toBe(false)
  })
  it('recusa vazio e formato errado', () => {
    expect(lerAgendamento('', agora).ok).toBe(false)
    expect(lerAgendamento('amanhã', agora).ok).toBe(false)
    expect(lerAgendamento('2026-13-45T99:99', agora).ok).toBe(false)
  })
})

it('rotulo mostra dia e hora de Brasília', () => {
  expect(rotuloAgendamento('2026-10-10T22:30:00.000Z')).toContain('19:30')
})

it('limites do campo em hora de Brasília', () => {
  expect(limitesDoCampo(agora)).toEqual({ min: '2026-10-10T13:00', max: '2026-10-17T12:00' })
})
