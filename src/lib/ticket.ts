/**
 * Ticket de pedido para impressora térmica (58 ou 80 mm), sem banco e sem tela: dá para testar sozinho.
 * Não é documento fiscal.
 */
import type { Origem } from '@/lib/origem'
import { naCozinha } from '@/lib/pedidosDoDia'

export const LARGURAS = [
  { valor: '80', rotulo: '80 mm' },
  { valor: '58', rotulo: '58 mm' },
] as const
export type Largura = (typeof LARGURAS)[number]['valor']

export const lerLargura = (v: unknown): Largura => (v === '58' ? '58' : '80')

/** Cópias de cada ticket: de 1 a 3. */
export const lerVias = (v: unknown) => Math.min(3, Math.max(1, Math.trunc(Number(v)) || 1))

export type ItemTicket = { nome: string; quantidade: number; opcoes: string; precoUnitario: number; setor: string; embalagem: string }

/** `completo`: com preços, endereço e pagamento. Os demais (por setor) levam só o que o setor precisa fazer. */
export type Ticket = { setor: string | null; itens: ItemTicket[]; completo: boolean }

/** Um ticket por setor que tem item no pedido (o primeiro leva os dados completos); loja sem setores, um só. */
export function montarTickets(itens: ItemTicket[], setores: string[]): Ticket[] {
  if (!setores.length) return [{ setor: null, itens, completo: true }]
  const doSetor = (s: string) => itens.filter((i) => i.setor.toLowerCase() === s.toLowerCase())
  const sem = itens.filter((i) => !setores.some((s) => s.toLowerCase() === i.setor.toLowerCase()))
  const tickets = setores.map((s, n) => ({ setor: s, itens: [...doSetor(s), ...(n === 0 ? sem : [])] })).filter((t) => t.itens.length)
  return tickets.map((t, n) => ({ ...t, completo: n === 0 }))
}

export type ConfigImpressao = { ligada: boolean; origens: Origem[] }

type Pedido = { impresso?: boolean | null; status: string; origem: Origem; agendadoPara: string | null }

/** Falta imprimir? Só com a impressão ligada, a origem escolhida, sem cancelar e, se agendado, perto da hora. */
export const deveImprimir = (p: Pedido, c: ConfigImpressao, agora = new Date()) =>
  c.ligada && !p.impresso && p.status !== 'cancelado' && c.origens.includes(p.origem) && naCozinha(p.agendadoPara, agora)
