/**
 * Contas a pagar e a receber, sem banco e sem tela: dá para testar sozinhas.
 * Datas são texto AAAA-MM-DD (dia do vencimento, sem hora); valores somados em centavos.
 */
import { hojeEmBrasilia } from './entregadores'

export const CATEGORIAS = [
  'Fornecedores',
  'Aluguel',
  'Funcionários',
  'Impostos',
  'Água/luz/gás/internet',
  'Taxas de cartão',
  'Outros',
] as const

export const TIPOS = [
  { value: 'pagar', label: 'A pagar', baixa: 'Marcar como pago', feito: 'Pago' },
  { value: 'receber', label: 'A receber', baixa: 'Marcar como recebido', feito: 'Recebido' },
] as const
export type Tipo = (typeof TIPOS)[number]['value']

const dois = (n: number) => String(n).padStart(2, '0')
const c = (v: number) => Math.round(v * 100)

/** "2026-10-31" → data válida ou null. */
export function lerData(t: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null
  const d = new Date(`${t}T00:00:00Z`)
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== t ? null : t
}

/** O mesmo dia do mês seguinte; mês curto cai no último dia (31/01 → 28/02), e `diaDoMes` evita a deriva (depois volta a 31/03). */
export function proximoVencimento(venc: string, diaDoMes?: number): string {
  const [a, m, d] = venc.split('-').map(Number)
  const ano = m === 12 ? a + 1 : a
  const mes = m === 12 ? 1 : m + 1
  const ultimo = new Date(Date.UTC(ano, mes, 0)).getUTCDate()
  return `${ano}-${dois(mes)}-${dois(Math.min(diaDoMes ?? d, ultimo))}`
}

export function somarDias(dia: string, dias: number): string {
  const d = new Date(`${dia}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

export type Situacao = 'vencida' | 'hoje' | 'em7' | 'futura'

export function situacao(vencimento: string, hoje = hojeEmBrasilia()): Situacao {
  if (vencimento < hoje) return 'vencida'
  if (vencimento === hoje) return 'hoje'
  return vencimento <= somarDias(hoje, 7) ? 'em7' : 'futura'
}

/** Vencidas, que vencem hoje e que vencem nos próximos 7 dias (quantas e quanto). */
export function alertas(contas: { valor: number; vencimento: string }[], hoje = hojeEmBrasilia()) {
  const r = {
    vencidas: { n: 0, total: 0 },
    hoje: { n: 0, total: 0 },
    em7: { n: 0, total: 0 },
  }
  for (const conta of contas) {
    const s = situacao(conta.vencimento, hoje)
    if (s === 'futura') continue
    const k = s === 'vencida' ? 'vencidas' : s
    r[k] = { n: r[k].n + 1, total: (c(r[k].total) + c(conta.valor)) / 100 }
  }
  return r
}

/** "2026-10" (ou vazio = este mês) → o mês e o intervalo em ISO, no horário de Brasília. */
export function intervaloDoMes(mes: string | undefined, agora = new Date()) {
  const valido = mes && /^\d{4}-(0[1-9]|1[0-2])$/.test(mes) ? mes : hojeEmBrasilia(agora).slice(0, 7)
  const de = new Date(`${valido}-01T00:00:00-03:00`)
  const prox = proximoVencimento(`${valido}-01`)
  return { mes: valido, de: de.toISOString(), ate: new Date(`${prox}T00:00:00-03:00`).toISOString() }
}

/**
 * Resumo do mês: vendas por forma de pagamento (já sem pedidos que ainda não terminaram) mais o que
 * se recebeu menos o que se pagou. A taxa de serviço das mesas é dos funcionários: sai das vendas.
 */
export function resumoDoMes(
  vendas: { forma: string; valor: number }[],
  taxaServico: number,
  recebido: number,
  pago: number,
) {
  const porForma = new Map<string, number>()
  for (const v of vendas) porForma.set(v.forma, (porForma.get(v.forma) ?? 0) + c(v.valor))
  const total = [...porForma.values()].reduce((s, x) => s + x, 0)
  const semTaxa = total - c(taxaServico)
  return {
    porForma: [...porForma].map(([forma, x]) => ({ forma, valor: x / 100 })),
    vendas: semTaxa / 100,
    taxaServico,
    recebido,
    pago,
    saldo: (semTaxa + c(recebido) - c(pago)) / 100,
  }
}
