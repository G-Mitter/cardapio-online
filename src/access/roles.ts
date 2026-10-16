import type { Access } from 'payload'

/**
 * Dois tipos de usuário:
 * - admin: você. Vê e edita todas as lojas, cria lojas e usuários.
 * - loja: o dono de uma loja. O plugin de multi-cliente limita o que ele vê às lojas dele.
 */
export const ehAdmin = (user: unknown): boolean =>
  Boolean((user as { roles?: string[] } | null)?.roles?.includes('admin'))

export const soAdmin: Access = ({ req: { user } }) => ehAdmin(user)

/**
 * Para campos da loja que não são públicos (ex.: CPF/CNPJ): só o administrador e os donos daquela loja.
 * `Lojas.read` é público, então o sigilo precisa ser por campo.
 */
export const adminOuDonoDaLoja = ({ req: { user }, doc }: { req: { user?: unknown }; doc?: { id?: unknown } }): boolean => {
  if (ehAdmin(user)) return true
  const tenants = (user as { tenants?: { tenant?: unknown }[] } | null)?.tenants ?? []
  const id = (t: unknown) => (typeof t === 'object' && t ? (t as { id?: unknown }).id : t)
  return tenants.some((t) => doc?.id != null && id(t.tenant) === doc.id)
}

/** Logado e não desligado (garçom desligado perde o acesso na hora, mesmo com o login aberto). */
export const logado: Access = ({ req: { user } }) =>
  Boolean(user) && (user as { ativo?: boolean }).ativo !== false

export const todos: Access = () => true
