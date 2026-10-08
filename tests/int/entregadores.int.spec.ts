import { describe, expect, it } from 'vitest'

import { calcularAcerto, diferencaDoAcerto, intervaloDoDia, mensagemRota, resumoPorEntregador } from '@/lib/entregadores'

describe('mensagemRota', () => {
  it('lista as paradas na ordem, com endereço, e termina com o mapa', () => {
    const t = mensagemRota(
      [
        { numero: 12, nome: 'Maria', telefone: '31999990000', endereco: 'Rua A, 10, Centro' },
        { numero: 9, nome: 'João', telefone: '', endereco: 'Rua B, 5, Savassi' },
      ],
      'https://maps/x',
      'Carlos Souza',
    )
    expect(t).toBe(
      'Olá, Carlos! Rota de entrega:\n\n1. Pedido nº 12 · Maria (31999990000)\nRua A, 10, Centro\n2. Pedido nº 9 · João\nRua B, 5, Savassi\n\nMapa: https://maps/x',
    )
  })
  it('sem entregador não tem saudação', () => {
    expect(mensagemRota([], 'l')).toMatch(/^Rota de entrega:/)
  })
})

describe('intervaloDoDia', () => {
  it('usa a meia-noite de Brasília e cobre 24 horas', () => {
    expect(intervaloDoDia('2026-10-08')).toEqual({
      dia: '2026-10-08',
      de: '2026-10-08T03:00:00.000Z',
      ate: '2026-10-09T03:00:00.000Z',
    })
  })
  it('data inválida ou vazia vira hoje', () => {
    const agora = new Date('2026-10-08T01:00:00Z') // ainda dia 7 em Brasília
    expect(intervaloDoDia('lixo', agora).dia).toBe('2026-10-07')
    expect(intervaloDoDia(undefined, agora).dia).toBe('2026-10-07')
  })
})

describe('resumoPorEntregador', () => {
  it('conta entregas e soma a taxa em centavos, em ordem alfabética', () => {
    const r = resumoPorEntregador([
      { entregador: 'Zeca', taxa: 5 },
      { entregador: 'Ana', taxa: 0.1 },
      { entregador: 'Ana', taxa: 0.2 },
    ])
    expect(r).toEqual([
      { entregador: 'Ana', entregas: 2, taxa: 0.3 },
      { entregador: 'Zeca', entregas: 1, taxa: 5 },
    ])
  })
})

describe('acerto do entregador', () => {
  const entregas = [
    { total: 45.5, taxa: 5, pagamento: 'dinheiro' },
    { total: 30.1, taxa: 4, pagamento: 'dinheiro' },
    { total: 60, taxa: 6, pagamento: 'cartao' },
    { total: 25, taxa: 5, pagamento: 'pix' },
    { total: 20, taxa: 5 },
  ]
  it('esperado é o dinheiro mais o troco que ele levou; cartão e Pix à parte', () => {
    expect(calcularAcerto(entregas, 50, false)).toEqual({
      dinheiro: 75.6,
      cartao: 60,
      pix: 25,
      taxas: 25,
      esperado: 125.6,
    })
  })
  it('se ele já descontou a taxa do dinheiro, a taxa sai do esperado', () => {
    expect(calcularAcerto(entregas, 0, true).esperado).toBe(50.6)
  })
  it('diferença: confere, sobrou ou faltou', () => {
    expect(diferencaDoAcerto(125.6, 125.6).rotulo).toBe('Confere')
    expect(diferencaDoAcerto(130, 125.6).rotulo).toMatch(/^Sobrou/)
    expect(diferencaDoAcerto(120, 125.6)).toMatchObject({ valor: -5.6 })
    expect(diferencaDoAcerto(120, 125.6).rotulo).toMatch(/^Faltou/)
  })
})
