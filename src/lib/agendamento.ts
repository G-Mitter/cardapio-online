/**
 * Pedido agendado: o cliente escolhe dia e hora para receber ou retirar.
 * Sem banco e sem tela: dá para testar sozinho.
 */

/** Antecedência mínima e máxima do agendamento. */
export const MIN_MINUTOS = 60
export const MAX_DIAS = 7

/**
 * Lê "2026-10-10T19:30" (o valor do campo datetime-local) e devolve o instante em ISO (UTC).
 * ponytail: fuso fixo -03:00 (o Brasil não tem horário de verão desde 2019); guardar o fuso na loja se surgir cliente fora dele.
 */
export function lerAgendamento(
  valor: string | null | undefined,
  agora = new Date(),
): { ok: true; quando: string } | { ok: false; erro: string } {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(valor ?? '')) {
    return { ok: false, erro: 'Escolha o dia e a hora do agendamento.' }
  }
  const t = new Date(`${valor}:00-03:00`)
  if (Number.isNaN(t.getTime())) return { ok: false, erro: 'Data do agendamento inválida.' }
  const minutos = (t.getTime() - agora.getTime()) / 60_000
  if (minutos < MIN_MINUTOS) {
    return { ok: false, erro: `Agende com pelo menos ${MIN_MINUTOS / 60} hora de antecedência.` }
  }
  if (minutos > MAX_DIAS * 24 * 60) {
    return { ok: false, erro: `Só dá para agendar até ${MAX_DIAS} dias à frente.` }
  }
  return { ok: true, quando: t.toISOString() }
}

/** "sáb., 10/10 às 19:30", no horário de Brasília. */
export function rotuloAgendamento(quando: string | Date): string {
  const t = new Date(quando)
  const dia = t.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  })
  const hora = t.toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${dia} às ${hora}`
}

/** Limites para o campo datetime-local do navegador (hora de Brasília, "AAAA-MM-DDTHH:MM"). */
export function limitesDoCampo(agora = new Date()): { min: string; max: string } {
  const fmt = (t: Date) =>
    t.toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 16).replace(' ', 'T')
  return {
    min: fmt(new Date(agora.getTime() + MIN_MINUTOS * 60_000)),
    max: fmt(new Date(agora.getTime() + MAX_DIAS * 24 * 60 * 60_000)),
  }
}
