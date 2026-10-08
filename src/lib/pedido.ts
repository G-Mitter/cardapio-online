/**
 * Regras do pedido, sem banco e sem tela: dá para testar sozinhas.
 *
 * O navegador manda só "qual produto e quantos". Preço, taxa e total são
 * recalculados aqui com os dados do banco, então ninguém consegue mudar
 * o preço editando a página.
 */

import { type Escolhas, type GrupoOpcao, resolverEscolhas } from './opcoes'

export type Modo = 'entrega' | 'retirada'

/** Formas de pagamento que uma loja pode aceitar. O pagamento é feito na entrega ou na retirada. */
export const FORMAS_PAGAMENTO = [
  { value: 'pix', label: 'Pix' },
  { value: 'cartao', label: 'Cartão' },
  { value: 'dinheiro', label: 'Dinheiro' },
] as const
export type FormaPagamento = (typeof FORMAS_PAGAMENTO)[number]['value']

export const rotuloPagamento = (f: string | null | undefined) =>
  FORMAS_PAGAMENTO.find((x) => x.value === f)?.label ?? ''

/**
 * CPF só com os 11 dígitos, se os dígitos verificadores batem; senão null.
 * Serve para o cliente não mandar um número errado para a nota da loja.
 */
export function lerCpf(valor: string | null | undefined): string | null {
  const d = (valor ?? '').replace(/\D/g, '')
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return null
  const digito = (n: number) => {
    const soma = [...d.slice(0, n)].reduce((s, c, i) => s + Number(c) * (n + 1 - i), 0)
    return ((soma * 10) % 11) % 10
  }
  return digito(9) === Number(d[9]) && digito(10) === Number(d[10]) ? d : null
}

export const formatarCpf = (cpf: string) =>
  cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')

export type ProdutoParaPedido = {
  id: number | string
  nome: string
  preco: number
  esgotado?: boolean | null
  opcoes?: GrupoOpcao[]
}

export type ItemEscolhido = { produto: number | string; quantidade: number; escolhas?: Escolhas }

export type ItemPedido = {
  produto: number | string
  nome: string
  quantidade: number
  /** Já com os adicionais. */
  precoUnitario: number
  /** Opções escolhidas, em texto; vazio se o produto não tem. */
  opcoes: string
  escolhas: Escolhas
}

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
  for (const { produto, quantidade, escolhas } of escolhidos) {
    const p = produtos.find((x) => String(x.id) === String(produto))
    if (!p) return { ok: false, erro: 'Um dos produtos não existe mais. Atualize a página.' }
    if (p.esgotado) return { ok: false, erro: `${p.nome} acabou de esgotar.` }
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > MAX_QUANTIDADE) {
      return { ok: false, erro: `Quantidade inválida para ${p.nome}.` }
    }
    const o = resolverEscolhas(p.opcoes ?? [], escolhas)
    if (!o.ok) return { ok: false, erro: `${p.nome}: ${o.erro}` }
    itens.push({
      produto: p.id,
      nome: p.nome,
      quantidade,
      precoUnitario: (centavos(p.preco) + centavos(o.adicional)) / 100,
      opcoes: o.descricao,
      escolhas: escolhas ?? {},
    })
  }

  const subtotal = itens.reduce((s, i) => s + centavos(i.precoUnitario) * i.quantidade, 0)
  const taxa = modo === 'entrega' ? centavos(taxaEntrega) : 0
  return {
    ok: true,
    pedido: { itens, subtotal: subtotal / 100, taxa: taxa / 100, total: (subtotal + taxa) / 100 },
  }
}

export const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/** Texto que chega no WhatsApp da loja. Os asteriscos deixam a linha em negrito no WhatsApp. */
export function mensagemPedido(args: {
  loja: string
  numero: number | string
  pedido: Pedido
  modo: Modo
  nome: string
  endereco?: string
  observacoes?: string
  pagamento?: FormaPagamento
  /** Só no dinheiro: o cliente paga com quanto, para a loja levar o troco. */
  trocoPara?: number | null
  cpf?: string | null
  /** Só na retirada: o código que o cliente mostra ao buscar o pedido. */
  codigoRetirada?: string
}): string {
  const {
    loja,
    numero,
    pedido,
    modo,
    nome,
    endereco,
    observacoes,
    pagamento,
    trocoPara,
    cpf,
    codigoRetirada,
  } = args
  const linhas = [
    `*Pedido nº ${numero} · ${loja}*`,
    '',
    ...pedido.itens.map(
      (i) =>
        `• ${i.quantidade}x ${i.nome}${i.opcoes ? ` (${i.opcoes})` : ''}: ${brl(i.precoUnitario * i.quantidade)}`,
    ),
    modo === 'entrega' ? `• Entrega: ${brl(pedido.taxa)}` : '• Retirada no local',
    `*Total: ${brl(pedido.total)}*`,
    '',
    `Nome: ${nome}`,
  ]
  if (modo === 'entrega' && endereco) linhas.push(`Endereço: ${endereco}`)
  if (modo === 'retirada' && codigoRetirada) linhas.push(`*Código de retirada: ${codigoRetirada}*`)
  if (pagamento) {
    const troco = trocoPara ? `, troco para ${brl(trocoPara)}` : ''
    linhas.push(`Pagamento: ${rotuloPagamento(pagamento)}${troco}`)
  }
  if (cpf) linhas.push(`CPF na nota: ${formatarCpf(cpf)}`)
  if (observacoes) linhas.push(`Obs.: ${observacoes}`)
  return linhas.join('\n')
}
