/**
 * Regras da tela de pedidos da loja, sem banco e sem tela: dá para testar sozinhas.
 */

export const STATUS = ['novo', 'preparando', 'pronto', 'entregue', 'cancelado'] as const
export type Status = (typeof STATUS)[number]

export const ROTULO: Record<Status, string> = {
  novo: 'Novo',
  preparando: 'Preparando',
  pronto: 'Pronto / saiu',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

/** Próximo passo de cada status: é o botão grande do cartão do pedido. */
export const PROXIMO: Partial<Record<Status, Status>> = {
  novo: 'preparando',
  preparando: 'pronto',
  pronto: 'entregue',
}

/**
 * Meia-noite de hoje no horário de Brasília, em ISO (UTC).
 * ponytail: fuso fixo -03:00 (o Brasil não tem horário de verão desde 2019); guardar o fuso na loja se surgir cliente fora dele.
 */
export function inicioDoDia(agora = new Date()): string {
  const dia = agora.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }) // AAAA-MM-DD
  return new Date(`${dia}T00:00:00-03:00`).toISOString()
}

/** Pedidos em aberto primeiro (novo, preparando, pronto); dentro de cada status, o mais antigo primeiro. */
export function ordenar<T extends { status: Status; createdAt: string }>(pedidos: T[]): T[] {
  return [...pedidos].sort(
    (a, b) =>
      STATUS.indexOf(a.status) - STATUS.indexOf(b.status) || a.createdAt.localeCompare(b.createdAt),
  )
}
