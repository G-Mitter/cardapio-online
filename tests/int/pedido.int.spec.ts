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
