/**
 * Entregadores: mensagem da rota e relatório do dia, sem banco e sem tela: dá para testar sozinhos.
 */
import { brl } from './pedido'

export type Parada = { numero: number; nome: string; telefone: string; endereco: string }

/** Texto que vai por WhatsApp para o entregador: as paradas na ordem da rota e o link do mapa. */
export function mensagemRota(paradas: Parada[], link: string, entregador?: string): string {
  const nome = entregador?.trim().split(/\s+/)[0]
  return [
    `${nome ? `Olá, ${nome}! ` : ''}Rota de entrega:`,
    '',
    ...paradas.map(
      (p, i) => `${i + 1}. Pedido nº ${p.numero} · ${p.nome}${p.telefone ? ` (${p.telefone})` : ''}\n${p.endereco}`,
    ),
    '',
    `Mapa: ${link}`,
  ].join('\n')
}

/** Hoje, no horário de Brasília, como AAAA-MM-DD. */
export const hojeEmBrasilia = (agora = new Date()) =>
  agora.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })

/**
 * O dia escolhido no relatório (AAAA-MM-DD, horário de Brasília) como intervalo em ISO.
 * Data inválida vira hoje.
 * ponytail: fuso fixo -03:00, igual a inicioDoDia em pedidosDoDia.ts.
 */
export function intervaloDoDia(dia: string | undefined, agora = new Date()) {
  const valido = dia && /^\d{4}-\d{2}-\d{2}$/.test(dia) && !Number.isNaN(Date.parse(dia)) ? dia : hojeEmBrasilia(agora)
  const inicio = new Date(`${valido}T00:00:00-03:00`)
  return { dia: valido, de: inicio.toISOString(), ate: new Date(inicio.getTime() + 24 * 3600_000).toISOString() }
}

export type EntregaFeita = { entregador: string; taxa: number }

/** Quantas entregas e quanto de taxa cada entregador fez; ordem alfabética. */
export function resumoPorEntregador(entregas: EntregaFeita[]): { entregador: string; entregas: number; taxa: number }[] {
  const porNome = new Map<string, { entregas: number; centavos: number }>()
  for (const e of entregas) {
    const atual = porNome.get(e.entregador) ?? { entregas: 0, centavos: 0 }
    porNome.set(e.entregador, { entregas: atual.entregas + 1, centavos: atual.centavos + Math.round(e.taxa * 100) })
  }
  return [...porNome]
    .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
    .map(([entregador, v]) => ({ entregador, entregas: v.entregas, taxa: v.centavos / 100 }))
}

export const rotuloResumo = (r: { entregas: number; taxa: number }) =>
  `${r.entregas} ${r.entregas === 1 ? 'entrega' : 'entregas'} · taxa ${brl(r.taxa)}`

export type EntregaParaAcerto = { total: number; taxa: number; pagamento?: string | null }

/**
 * O que o entregador deve trazer. Em dinheiro, ele recebe o total do pedido do cliente; Pix e cartão
 * só aparecem para conferir. Se ele já descontou a taxa de entrega do dinheiro, a taxa sai do esperado.
 * `troco` é o que a loja deu a ele para troco na saída e que deve voltar. Tudo em centavos por dentro.
 */
export function calcularAcerto(entregas: EntregaParaAcerto[], troco: number, descontouTaxa: boolean) {
  const c = (v: number) => Math.round(v * 100)
  const soma = (f: (e: EntregaParaAcerto) => boolean) => entregas.filter(f).reduce((s, e) => s + c(e.total), 0)
  const dinheiro = soma((e) => e.pagamento === 'dinheiro')
  const taxas = entregas.reduce((s, e) => s + c(e.taxa), 0)
  const esperado = dinheiro + c(troco) - (descontouTaxa ? taxas : 0)
  return {
    dinheiro: dinheiro / 100,
    cartao: soma((e) => e.pagamento === 'cartao') / 100,
    pix: soma((e) => e.pagamento === 'pix') / 100,
    taxas: taxas / 100,
    esperado: esperado / 100,
  }
}

/** Entregue menos esperado: "confere", "sobrou R$ x" ou "faltou R$ x". */
export function diferencaDoAcerto(entregue: number, esperado: number) {
  const d = Math.round(entregue * 100) - Math.round(esperado * 100)
  const valor = d / 100
  return { valor, rotulo: d === 0 ? 'Confere' : `${d > 0 ? 'Sobrou' : 'Faltou'} ${brl(Math.abs(valor))}` }
}
