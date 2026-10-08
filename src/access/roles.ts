import type { Access } from 'payload'

/**
 * Dois tipos de usuário:
 * - admin: você. Vê e edita todas as lojas, cria lojas e usuários.
 * - loja: o dono de uma loja. O plugin de multi-cliente limita o que ele vê às lojas dele.
 */
export const ehAdmin = (user: unknown): boolean =>
  Boolean((user as { roles?: string[] } | null)?.roles?.includes('admin'))

export const soAdmin: Access = ({ req: { user } }) => ehAdmin(user)

/** Logado e não desligado (garçom desligado perde o acesso na hora, mesmo com o login aberto). */
export const logado: Access = ({ req: { user } }) =>
  Boolean(user) && (user as { ativo?: boolean }).ativo !== false

export const todos: Access = () => true
