/** Máscaras dos campos do painel: a pessoa digita só números e o campo já escreve no formato certo. */

/** Só os dígitos digitados viram centavos: "1250" = 12,50. Limita a R$ 999.999,99. */
export const centavosDoTexto = (texto: string) => Math.min(99_999_999, Number(texto.replace(/\D/g, '')) || 0)

/** 125030 → "1.250,30". O resultado é lido por `lerPreco` sem mudança. */
export const dinheiroDeCentavos = (centavos: number) =>
  (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** "31999990000" → "(31) 99999-0000"; com 10 dígitos, "(31) 9999-0000". Aceita no máximo 11 dígitos. */
export function mascararTelefone(texto: string) {
  const d = texto.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  const meio = d.length > 10 ? 7 : 6
  return `(${d.slice(0, 2)}) ${d.slice(2, meio)}${d.length > meio ? `-${d.slice(meio)}` : ''}`
}
