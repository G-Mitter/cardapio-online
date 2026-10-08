/**
 * Fechar a conta da mesa: taxa de serviço, pagamento em mais de uma forma, troco e divisão.
 * Sem banco e sem tela: dá para testar sozinho. Tudo em centavos para não errar o arredondamento.
 */
import type { FormaPagamento } from './pedido'

export const MAX_TAXA_SERVICO = 30

const centavos = (v: number) => Math.round(v * 100)

/** Taxa de serviço em %, do texto do painel ("10", "10,5"); vazio é desligada (0). */
export function lerTaxaServico(texto: string): { ok: true; valor: number } | { ok: false; erro: string } {
  const t = texto.trim().replace(',', '.')
  if (!t) return { ok: true, valor: 0 }
  const n = Number(t)
  if (!/^\d+(\.\d{1,2})?$/.test(t) || n > MAX_TAXA_SERVICO) {
    return { ok: false, erro: `Taxa de serviço de 0 a ${MAX_TAXA_SERVICO}%. Use, por exemplo, 10.` }
  }
  return { ok: true, valor: n }
}

/** Taxa e total da conta. `subtotal` em reais; sem `cobrar` (ou taxa 0) a taxa é zero. */
export function totalDaConta(subtotal: number, taxaPct: number, cobrar: boolean) {
  const base = centavos(subtotal)
  const taxa = cobrar ? Math.round((base * taxaPct) / 100) : 0
  return { taxaServico: taxa / 100, total: (base + taxa) / 100 }
}

/** Quanto cada um paga ao dividir; sobra de centavos vai para cima (a casa nunca fica devendo). */
export const valorPorPessoa = (total: number, pessoas: number) =>
  pessoas > 1 ? Math.ceil(centavos(total) / Math.floor(pessoas)) / 100 : total

export type Recebido = { forma: FormaPagamento; valor: number }

/**
 * O que a mesa entregou (por forma) contra o total. Passou do total é troco, e só dá para
 * devolver troco de dinheiro. `pagamentos` guarda o que ficou de fato (dinheiro já sem o troco),
 * então a soma bate com o total.
 */
export function fecharPagamento(
  total: number,
  recebido: Recebido[],
): { ok: true; pagamentos: Recebido[]; troco: number } | { ok: false; erro: string } {
  const porForma = new Map<FormaPagamento, number>()
  for (const r of recebido) {
    const c = centavos(Number(r.valor))
    if (!Number.isFinite(c) || c < 0) return { ok: false, erro: 'Valor de pagamento inválido.' }
    if (c > 0) porForma.set(r.forma, (porForma.get(r.forma) ?? 0) + c)
  }
  const soma = [...porForma.values()].reduce((s, c) => s + c, 0)
  const falta = centavos(total) - soma
  if (falta > 0) return { ok: false, erro: `Faltam ${(falta / 100).toFixed(2).replace('.', ',')} para pagar a conta.` }
  const troco = Math.max(0, -falta)
  const dinheiro = porForma.get('dinheiro') ?? 0
  // Cartão e Pix passam o valor exato: só o dinheiro gera troco.
  if (soma - dinheiro > centavos(total) || troco > dinheiro) {
    return { ok: false, erro: 'Só dá para dar troco de dinheiro. Confira os valores.' }
  }
  if (troco) porForma.set('dinheiro', dinheiro - troco)
  return {
    ok: true,
    troco: troco / 100,
    pagamentos: [...porForma].filter(([, c]) => c > 0).map(([forma, c]) => ({ forma, valor: c / 100 })),
  }
}

export type ContaFechada = { garcom: string; subtotal: number; taxaServico: number }

/** Por garçom: mesas atendidas, total vendido (sem a taxa) e taxa de serviço; ordem alfabética. */
export function resumoPorGarcom(contas: ContaFechada[]) {
  const porNome = new Map<string, { mesas: number; subtotal: number; taxa: number }>()
  for (const c of contas) {
    const a = porNome.get(c.garcom) ?? { mesas: 0, subtotal: 0, taxa: 0 }
    porNome.set(c.garcom, { mesas: a.mesas + 1, subtotal: a.subtotal + centavos(c.subtotal), taxa: a.taxa + centavos(c.taxaServico) })
  }
  return [...porNome]
    .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
    .map(([garcom, v]) => ({ garcom, mesas: v.mesas, vendido: v.subtotal / 100, taxaServico: v.taxa / 100 }))
}
