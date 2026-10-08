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
 * Mensagem para o cliente quando a loja muda o status. O painel abre o WhatsApp
 * da loja com ela pronta para o número do cliente; a loja só toca em enviar.
 */
export function avisoDeStatus(p: {
  status: Status
  numero: number
  nome: string
  loja: string
  modo: 'entrega' | 'retirada'
}): string | null {
  const situacao: Partial<Record<Status, string>> = {
    preparando: 'está sendo preparado',
    pronto: p.modo === 'entrega' ? 'saiu para entrega' : 'está pronto para retirada',
    entregue:
      p.modo === 'entrega'
        ? 'foi entregue. Obrigado pela preferência!'
        : 'foi retirado. Obrigado pela preferência!',
    cancelado: 'foi cancelado. Se tiver alguma dúvida, é só responder esta mensagem.',
  }
  const texto = situacao[p.status]
  const nome = p.nome.trim().split(/\s+/)[0]
  return texto ? `Olá, ${nome}! Seu pedido nº ${p.numero} na ${p.loja} ${texto}` : null
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

/** Quanto antes do horário marcado um pedido agendado aparece na cozinha. */
export const ANTECEDENCIA_COZINHA_MIN = 60

/** Pedido na tela da cozinha: sem agendamento, ou agendado para daqui a no máximo 1 hora (ou atrasado). */
export function naCozinha(agendadoPara: string | null, agora = new Date()): boolean {
  if (!agendadoPara) return true
  return new Date(agendadoPara).getTime() - agora.getTime() <= ANTECEDENCIA_COZINHA_MIN * 60_000
}

/** Como o pedido aparece na tela: pedido de balcão é "Balcão"; os demais, o modo. */
export const rotuloTipo = (modo: 'entrega' | 'retirada', balcao?: boolean | null) =>
  balcao ? 'Balcão' : modo === 'entrega' ? 'Entrega' : 'Retirada'
