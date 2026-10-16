/**
 * Relatórios de vendas, sem banco e sem tela: dá para testar sozinhos.
 * Valores em reais, somados em centavos; dias em Brasília (AAAA-MM-DD).
 */
import { hojeEmBrasilia, intervaloDoDia } from './entregadores'
import { lerData, somarDias } from './financeiro'

/** Mais que isso fica pesado de consultar: o período é cortado. */
export const MAX_DIAS = 92

const c = (v: number) => Math.round(v * 100)

/** Período escolhido (de/ate inclusive). Vazio ou inválido: últimos 7 dias. Troca de ordem se vier invertido e corta em MAX_DIAS. */
export function periodo(de: string | undefined, ate: string | undefined, hoje = hojeEmBrasilia()) {
  let fim = (ate && lerData(ate)) || hoje
  let inicio = (de && lerData(de)) || somarDias(fim, -6)
  if (inicio > fim) [inicio, fim] = [fim, inicio]
  const cortado = inicio < somarDias(fim, -(MAX_DIAS - 1))
  if (cortado) inicio = somarDias(fim, -(MAX_DIAS - 1))
  return { de: inicio, ate: fim, cortado, desdeISO: intervaloDoDia(inicio).de, ateISO: intervaloDoDia(fim).ate }
}

export type PedidoVendido = {
  createdAt: string
  total: number
  itens?: { nome: string; quantidade: number; precoUnitario: number }[] | null
}

export function resumirVendas(pedidos: PedidoVendido[]) {
  let total = 0
  const dias = new Map<string, { pedidos: number; total: number }>()
  const produtos = new Map<string, { quantidade: number; total: number }>()
  for (const p of pedidos) {
    total += c(p.total)
    const dia = new Date(p.createdAt).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
    const d = dias.get(dia) ?? { pedidos: 0, total: 0 }
    dias.set(dia, { pedidos: d.pedidos + 1, total: d.total + c(p.total) })
    for (const i of p.itens ?? []) {
      const x = produtos.get(i.nome) ?? { quantidade: 0, total: 0 }
      produtos.set(i.nome, { quantidade: x.quantidade + i.quantidade, total: x.total + c(i.precoUnitario) * i.quantidade })
    }
  }
  return {
    pedidos: pedidos.length,
    total: total / 100,
    ticketMedio: pedidos.length ? Math.round(total / pedidos.length) / 100 : 0,
    porDia: [...dias].sort(([a], [b]) => a.localeCompare(b)).map(([dia, d]) => ({ dia, pedidos: d.pedidos, total: d.total / 100 })),
    // Mais vendidos primeiro; empate: o que mais faturou, depois o nome.
    produtos: [...produtos]
      .map(([nome, p]) => ({ nome, quantidade: p.quantidade, total: p.total / 100 }))
      .sort((a, b) => b.quantidade - a.quantidade || b.total - a.total || a.nome.localeCompare(b.nome, 'pt-BR')),
  }
}

/** Quanto entrou em cada forma de pagamento; maior valor primeiro. */
export function somarPorForma(pagamentos: { forma: string; valor: number }[]) {
  const porForma = new Map<string, number>()
  for (const p of pagamentos) porForma.set(p.forma, (porForma.get(p.forma) ?? 0) + c(p.valor))
  return [...porForma].map(([forma, v]) => ({ forma, valor: v / 100 })).sort((a, b) => b.valor - a.valor)
}
