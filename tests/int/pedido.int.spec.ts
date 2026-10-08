import { describe, expect, it } from 'vitest'

import { lerCpf, mensagemPedido, montarPedido } from '@/lib/pedido'

const produtos = [
  { id: 1, nome: 'Feijão tropeiro', preco: 32.9 },
  { id: 2, nome: 'Suco de laranja', preco: 9 },
  { id: 3, nome: 'Vaca atolada', preco: 39.9, esgotado: true },
]

// Teste de unidade: o total sai do preço do banco, não do que o navegador mandou.
describe('montarPedido', () => {
  it('soma itens e taxa de entrega sem erro de arredondamento', () => {
    const r = montarPedido(
      produtos,
      [
        { produto: 1, quantidade: 2 },
        { produto: '2', quantidade: 1 },
      ],
      6,
      'entrega',
    )
    expect(r.ok && r.pedido).toMatchObject({ subtotal: 74.8, taxa: 6, total: 80.8 })
  })

  it('não cobra taxa na retirada', () => {
    const r = montarPedido(produtos, [{ produto: 2, quantidade: 3 }], 6, 'retirada')
    expect(r.ok && r.pedido.total).toBe(27)
  })

  it('recusa produto esgotado, inexistente, quantidade inválida e pedido vazio', () => {
    expect(montarPedido(produtos, [{ produto: 3, quantidade: 1 }], 0, 'retirada').ok).toBe(false)
    expect(montarPedido(produtos, [{ produto: 99, quantidade: 1 }], 0, 'retirada').ok).toBe(false)
    expect(montarPedido(produtos, [{ produto: 1, quantidade: 0 }], 0, 'retirada').ok).toBe(false)
    expect(montarPedido(produtos, [{ produto: 1, quantidade: 1.5 }], 0, 'retirada').ok).toBe(false)
    expect(montarPedido(produtos, [], 0, 'retirada').ok).toBe(false)
  })
})

describe('mensagemPedido', () => {
  it('monta o texto que chega no WhatsApp da loja', () => {
    const r = montarPedido(produtos, [{ produto: 1, quantidade: 2 }], 6, 'entrega')
    if (!r.ok) throw new Error(r.erro)
    const msg = mensagemPedido({
      loja: 'Cantina Dona Lurdes',
      numero: 7,
      pedido: r.pedido,
      modo: 'entrega',
      nome: 'Ana',
      endereco: 'Rua A, 1',
      observacoes: 'Sem cebola',
    })
    expect(msg.replace(/ /g, ' ')).toBe(
      [
        '*Pedido nº 7 · Cantina Dona Lurdes*',
        '',
        '• 2x Feijão tropeiro: R$ 65,80',
        '• Entrega: R$ 6,00',
        '*Total: R$ 71,80*',
        '',
        'Nome: Ana',
        'Endereço: Rua A, 1',
        'Obs.: Sem cebola',
      ].join('\n'),
    )
  })
})

describe('pagamento, troco e CPF na nota', () => {
  it('aceita CPF com ou sem pontos e recusa dígito errado', () => {
    expect(lerCpf('529.982.247-25')).toBe('52998224725')
    expect(lerCpf('52998224725')).toBe('52998224725')
    expect(lerCpf('529.982.247-24')).toBeNull()
    expect(lerCpf('111.111.111-11')).toBeNull()
    expect(lerCpf('123')).toBeNull()
  })

  it('a loja recebe a forma de pagamento, o troco e o CPF', () => {
    const r = montarPedido(
      [{ id: 1, nome: 'X', preco: 30 }],
      [{ produto: 1, quantidade: 1 }],
      0,
      'retirada',
    )
    if (!r.ok) throw new Error(r.erro)
    const msg = mensagemPedido({
      loja: 'L',
      numero: 1,
      pedido: r.pedido,
      modo: 'retirada',
      nome: 'Ana',
      pagamento: 'dinheiro',
      trocoPara: 50,
      cpf: '52998224725',
    })
    expect(msg).toContain('Pagamento: Dinheiro, troco para R$')
    expect(msg).toContain('CPF na nota: 529.982.247-25')
  })
})

describe('código de retirada', () => {
  it('vai na mensagem só quando é retirada', () => {
    const r = montarPedido(
      [{ id: 1, nome: 'X', preco: 30 }],
      [{ produto: 1, quantidade: 1 }],
      5,
      'retirada',
    )
    if (!r.ok) throw new Error(r.erro)
    const base = { loja: 'L', numero: 1, pedido: r.pedido, nome: 'Ana', codigoRetirada: '0427' }
    expect(mensagemPedido({ ...base, modo: 'retirada' })).toContain('*Código de retirada: 0427*')
    expect(mensagemPedido({ ...base, modo: 'entrega' })).not.toContain('Código')
  })
})

describe('opções do produto', () => {
  const pizza = {
    id: 1,
    nome: 'Pizza',
    preco: 40,
    opcoes: [
      { id: 'g', nome: 'Borda', min: 0, max: 1, itens: [{ id: 'c', nome: 'Borda catupiry', preco: 6 }] },
    ],
  }

  it('soma o adicional no preço de cada unidade e põe a escolha na mensagem', () => {
    const r = montarPedido([pizza], [{ produto: 1, quantidade: 2, escolhas: { g: ['c'] } }], 0, 'retirada')
    if (!r.ok) throw new Error(r.erro)
    expect(r.pedido.total).toBe(92)
    expect(r.pedido.itens[0].opcoes).toBe('Borda catupiry')
    const msg = mensagemPedido({ loja: 'L', numero: 1, pedido: r.pedido, modo: 'retirada', nome: 'Ana' })
    expect(msg).toContain('• 2x Pizza (Borda catupiry): R$')
  })

  it('o servidor recusa opção que não existe no produto', () => {
    expect(montarPedido([pizza], [{ produto: 1, quantidade: 1, escolhas: { g: ['x'] } }], 0, 'retirada').ok).toBe(false)
  })
})

describe('cupom no pedido', () => {
  const cupom = { codigo: 'BEMVINDO10', tipo: 'porcentagem' as const, valor: 10 }

  it('abate dos produtos, não da taxa, e aparece na mensagem', () => {
    const r = montarPedido([{ id: 1, nome: 'X', preco: 50 }], [{ produto: 1, quantidade: 2 }], 6, 'entrega', cupom)
    if (!r.ok) throw new Error(r.erro)
    expect(r.pedido).toMatchObject({ subtotal: 100, taxa: 6, desconto: 10, cupom: 'BEMVINDO10', total: 96 })
    const msg = mensagemPedido({ loja: 'L', numero: 1, pedido: r.pedido, modo: 'entrega', nome: 'Ana' })
    expect(msg).toContain('• Cupom BEMVINDO10: -R$')
  })

  it('cupom que não vale derruba o pedido com o motivo', () => {
    const r = montarPedido([{ id: 1, nome: 'X', preco: 20 }], [{ produto: 1, quantidade: 1 }], 0, 'retirada', {
      ...cupom,
      minimo: 40,
    })
    expect(r.ok).toBe(false)
  })
})

describe('leve 3, pague 2 no pedido', () => {
  const lanche = { id: 1, nome: 'Lanche', preco: 20, leve: 3, pague: 2 }

  it('a unidade grátis sai do total, e o cupom vale sobre o que sobra', () => {
    const r = montarPedido([lanche], [{ produto: 1, quantidade: 3 }], 5, 'entrega', {
      codigo: 'DEZ',
      tipo: 'porcentagem',
      valor: 10,
    })
    if (!r.ok) throw new Error(r.erro)
    // 60 de produtos, 20 de promoção, cupom de 10% sobre 40 = 4, mais 5 de entrega.
    expect(r.pedido).toMatchObject({ subtotal: 60, promocao: 20, desconto: 4, total: 41 })
    const msg = mensagemPedido({ loja: 'L', numero: 1, pedido: r.pedido, modo: 'entrega', nome: 'Ana' })
    expect(msg).toContain('• Promoção leve e pague menos: -R$')
  })

  it('sem quantidade suficiente não há promoção', () => {
    const r = montarPedido([lanche], [{ produto: 1, quantidade: 2 }], 0, 'retirada')
    expect(r.ok && r.pedido.promocao).toBe(0)
  })
})
