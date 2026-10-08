import { expect, it } from 'vitest'

import { emMinutosAtras, mensagemRecuperacao, resumoDosItens } from '@/lib/carrinho'

it('resume os itens com as opções', () => {
  expect(
    resumoDosItens([
      { nome: 'Pizza', quantidade: 2, opcoes: 'Grande' },
      { nome: 'Suco', quantidade: 1, opcoes: '' },
    ]),
  ).toBe('2x Pizza (Grande), 1x Suco')
})

it('mensagem usa só o primeiro nome e o total', () => {
  const m = mensagemRecuperacao({
    nome: 'Maria da Silva',
    loja: 'Cantina',
    resumo: '1x Suco',
    total: 8,
  })
  expect(m).toContain('Olá, Maria!')
  expect(m).toContain('1x Suco')
  expect(m).toMatch(/R\$\s?8,00/)
})

it('calcula o corte de tempo', () => {
  expect(emMinutosAtras(30, new Date('2026-10-10T15:00:00Z'))).toBe('2026-10-10T14:30:00.000Z')
})
