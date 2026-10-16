/** De onde veio o pedido e como ele entra: sem banco e sem tela, dá para testar sozinho. */

export const ORIGENS = [
  { value: 'site', label: 'Cardápio online' },
  { value: 'mesa', label: 'QR Code da mesa' },
  { value: 'garcom', label: 'Garçom' },
  { value: 'balcao', label: 'Balcão' },
  { value: 'ifood', label: 'iFood' },
] as const

export type Origem = (typeof ORIGENS)[number]['value']

type Dados = { origem?: string | null; mesa?: string | null; garcom?: unknown; balcao?: boolean | null }

/** Quem criou o pedido já pode dizer a origem; senão ela sai dos campos de sempre (mesa, garçom, balcão). */
export function origemDoPedido(d: Dados): Origem {
  const dita = ORIGENS.find((o) => o.value === d.origem)
  if (dita) return dita.value
  if (d.mesa) return d.garcom ? 'garcom' : 'mesa'
  return d.balcao ? 'balcao' : 'site'
}

/**
 * Aceite automático: pedido que chega de fora (cardápio online, QR Code da mesa, iFood) já entra Preparando.
 * Fica Novo o que a própria equipe lançou e o agendado (que só vira trabalho perto da hora).
 */
export function entraAceito(origem: Origem, aceiteAutomatico: boolean | null | undefined, agendado: boolean): boolean {
  return Boolean(aceiteAutomatico) && !agendado && (origem === 'site' || origem === 'mesa' || origem === 'ifood')
}
