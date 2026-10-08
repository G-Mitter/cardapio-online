/**
 * Regras do pedido, sem banco e sem tela: dá para testar sozinhas.
 *
 * O navegador manda só "qual produto e quantos". Preço, taxa e total são
 * recalculados aqui com os dados do banco, então ninguém consegue mudar
 * o preço editando a página.
 */

export type Modo = 'entrega' | 'retirada'

/** Formas de pagamento que uma loja pode aceitar. O pagamento é feito na entrega ou na retirada. */
export const FORMAS_PAGAMENTO = [
  { value: 'pix', label: 'Pix' },
  { value: 'cartao', label: 'Cartão' },
  { value: 'dinheiro', label: 'Dinheiro' },
] as const
export type FormaPagamento = (typeof FORMAS_PAGAMENTO)[number]['value']

export type ProdutoParaPedido = {
  id: number | string
  nome: string
  preco: number
  esgotado?: boolean | null
}

export type ItemEscolhido = { produto: number | string; quantidade: number }

export type ItemPedido = { produto: number | string; nome: string; quantidade: number; precoUnitario: number }

export type Pedido = { itens: ItemPedido[]; subtotal: number; taxa: number; total: number }

export const MAX_QUANTIDADE = 50

/** Conta em centavos para não errar arredondamento (0,1 + 0,2 em reais dá 0,30000000000000004). */
const centavos = (reais: number) => Math.round(reais * 100)

export function montarPedido(
  produtos: ProdutoParaPedido[],
  escolhidos: ItemEscolhido[],
  taxaEntrega: number,
  modo: Modo,
): { ok: true; pedido: Pedido } | { ok: false; erro: string } {
  if (escolhidos.length === 0) return { ok: false, erro: 'O pedido está vazio.' }

  const itens: ItemPedido[] = []
  for (const { produto, quantidade } of escolhidos) {
    const p = produtos.find((x) => String(x.id) === String(produto))
    if (!p) return { ok: false, erro: 'Um dos produtos não existe mais. Atualize a página.' }
    if (p.esgotado) return { ok: false, erro: `${p.nome} acabou de esgotar.` }
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > MAX_QUANTIDADE) {
      return { ok: false, erro: `Quantidade inválida para ${p.nome}.` }
    }
    itens.push({ produto: p.id, nome: p.nome, quantidade, precoUnitario: p.preco })
  }

  const subtotal = itens.reduce((s, i) => s + centavos(i.precoUnitario) * i.quantidade, 0)
  const taxa = modo === 'entrega' ? centavos(taxaEntrega) : 0
  return {
    ok: true,
    pedido: { itens, subtotal: subtotal / 100, taxa: taxa / 100, total: (subtotal + taxa) / 100 },
  }
}

export const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/** Texto que chega no WhatsApp da loja. Os asteriscos deixam a linha em negrito no WhatsApp. */
export function mensagemPedido(args: {
  loja: string
  numero: number | string
  pedido: Pedido
  modo: Modo
  nome: string
  endereco?: string
  observacoes?: string
}): string {
  const { loja, numero, pedido, modo, nome, endereco, observacoes } = args
  const linhas = [
    `*Pedido nº ${numero} · ${loja}*`,
    '',
    ...pedido.itens.map((i) => `• ${i.quantidade}x ${i.nome}: ${brl(i.precoUnitario * i.quantidade)}`),
    modo === 'entrega' ? `• Entrega: ${brl(pedido.taxa)}` : '• Retirada no local',
    `*Total: ${brl(pedido.total)}*`,
    '',
    `Nome: ${nome}`,
  ]
  if (modo === 'entrega' && endereco) linhas.push(`Endereço: ${endereco}`)
  if (observacoes) linhas.push(`Obs.: ${observacoes}`)
  return linhas.join('\n')
}
