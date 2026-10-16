import { lerCpf } from './pedido'

/**
 * Cadastro da loja feito pelo próprio cliente (/cadastrar): CPF ou CNPJ e endereço do cardápio.
 * Sem banco e sem tela, para testar.
 */

/** CNPJ só com os 14 dígitos, se os dígitos verificadores batem; senão null. */
export function lerCnpj(valor: string | null | undefined): string | null {
  const d = (valor ?? '').replace(/\D/g, '')
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return null
  const digito = (pesos: number[]) => {
    const resto = pesos.reduce((s, p, i) => s + p * Number(d[i]), 0) % 11
    return resto < 2 ? 0 : 11 - resto
  }
  const p1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const p2 = [6, ...p1]
  return digito(p1) === Number(d[12]) && digito(p2) === Number(d[13]) ? d : null
}

/** CPF (11 dígitos) ou CNPJ (14) válido, só com os dígitos; senão null. */
export const lerDocumento = (valor: string | null | undefined): string | null => lerCpf(valor) ?? lerCnpj(valor)

/** Endereços que já são telas do sistema ou arquivos do site: a loja não pode ficar com eles. */
export const SLUGS_RESERVADOS = [
  'painel', 'admin', 'api', 'cadastrar', 'termos', 'privacidade', 'entrar', 'login', 'sair',
  'next', 'static', 'public', 'icon', 'favicon', 'robots', 'sitemap', 'media', 'loja', 'lojas',
] as const

const FORMATO_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

/** Mensagem de erro se o endereço não serve, ou null se serve (a unicidade quem confere é o banco). */
export function erroDoSlug(slug: string): string | null {
  if (!FORMATO_SLUG.test(slug)) return 'O endereço do cardápio só pode ter letras minúsculas, números e hífen.'
  if (slug.length < 3 || slug.length > 40) return 'O endereço do cardápio deve ter de 3 a 40 caracteres.'
  if ((SLUGS_RESERVADOS as readonly string[]).includes(slug)) return 'Este endereço não pode ser usado. Escolha outro.'
  return null
}

/** "Padaria São João!" → "padaria-sao-joao". Serve de sugestão; a pessoa pode mudar. */
export function slugDoNome(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/, '')
}
