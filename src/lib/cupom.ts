/**
 * Cupom de desconto, sem banco e sem tela: dá para testar sozinho.
 * O desconto vale só sobre os produtos (a taxa de entrega não entra) e nunca passa do subtotal.
 */

export type Cupom = {
  codigo: string
  tipo: 'valor' | 'porcentagem'
  /** R$ se tipo = valor; % (1 a 100) se tipo = porcentagem. */
  valor: number
  /** Subtotal mínimo do pedido para o cupom valer. */
  minimo?: number | null
  /** Data e hora (ISO) do fim da validade. */
  validoAte?: string | null
  limiteUso?: number | null
  usos?: number | null
  ativo?: boolean | null
}

/** O que o cliente digita ("verao 10", "Verao-10") vira o código guardado ("VERAO10", "VERAO-10"). */
export const normalizarCodigo = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .slice(0, 20)

const centavos = (reais: number) => Math.round(reais * 100)

/** O cupom vale até o fim do dia escolhido, no horário de Brasília (sem horário de verão desde 2019). */
export const fimDoDia = (dia: string) => `${dia}T23:59:59-03:00`
export const diaDoFim = (iso: string) => new Date(new Date(iso).getTime() - 3 * 3600_000).toISOString().slice(0, 10)

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const rotuloDoCupom = (c: Pick<Cupom, 'tipo' | 'valor'>) =>
  c.tipo === 'porcentagem' ? `${c.valor}%` : brl(c.valor)

/** Quanto o cupom abate neste subtotal (em reais), ou por que não vale. */
export function descontoDoCupom(
  c: Cupom,
  subtotal: number,
  agora = new Date(),
): { ok: true; desconto: number } | { ok: false; erro: string } {
  if (c.ativo === false) return { ok: false, erro: 'Este cupom não está mais valendo.' }
  if (c.validoAte && agora > new Date(c.validoAte)) return { ok: false, erro: 'Este cupom venceu.' }
  if (c.limiteUso && (c.usos ?? 0) >= c.limiteUso) return { ok: false, erro: 'Este cupom já foi usado o máximo de vezes.' }
  if (c.minimo && subtotal < c.minimo) {
    return { ok: false, erro: `Este cupom vale para pedidos a partir de ${brl(c.minimo)}.` }
  }
  const base = centavos(subtotal)
  const desconto =
    c.tipo === 'porcentagem' ? Math.round((base * Math.min(c.valor, 100)) / 100) : centavos(c.valor)
  return { ok: true, desconto: Math.min(desconto, base) / 100 }
}
