import { describe, expect, it } from 'vitest'

import { whatsappUrl } from '@/lib/whatsapp'

// Teste de unidade: garante que qualquer jeito de digitar o número gera o mesmo link.
describe('whatsappUrl', () => {
  it('aceita o número com máscara e coloca o 55', () => {
    expect(whatsappUrl('(31) 99999-0000')).toBe('https://wa.me/5531999990000')
  })

  it('não duplica o 55 quando ele já vem no número', () => {
    expect(whatsappUrl('+55 31 99999-0000')).toBe('https://wa.me/5531999990000')
  })

  it('codifica a mensagem pronta', () => {
    expect(whatsappUrl('31999990000', 'Olá, vi seu portfólio')).toBe(
      'https://wa.me/5531999990000?text=Ol%C3%A1%2C%20vi%20seu%20portf%C3%B3lio',
    )
  })

  it('devolve null para número vazio ou incompleto', () => {
    expect(whatsappUrl('')).toBeNull()
    expect(whatsappUrl('99999')).toBeNull()
  })
})
