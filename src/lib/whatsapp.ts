/**
 * Monta o link que abre uma conversa no WhatsApp: https://wa.me/<número>?text=<mensagem>
 *
 * O wa.me exige o número só com dígitos e com o código do país (55 no Brasil).
 * Assim, no /admin dá para digitar do jeito que for mais fácil:
 * "(31) 99999-0000", "31999990000" ou "+55 31 99999-0000" geram o mesmo link.
 *
 * Passo a passo:
 * 1. Tiramos tudo que não é dígito.
 * 2. Com 10 ou 11 dígitos (DDD + número), falta o país: colocamos 55 na frente.
 * 3. Fora de 12 ou 13 dígitos o número está incompleto: devolvemos null.
 * 4. A mensagem vai codificada (espaços e acentos viram %20, %C3%A1...).
 */
export function whatsappUrl(phone: string | null | undefined, message?: string): string | null {
  let digits = (phone ?? '').replace(/\D/g, '')
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`
  if (digits.length < 12 || digits.length > 13) return null

  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${digits}${text}`
}
