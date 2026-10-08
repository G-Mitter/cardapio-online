import type { Metadata } from 'next'

import { TelaCozinha } from '@/components/painel/TelaCozinha'
import { sessao } from '@/lib/painel'
import { naCozinha } from '@/lib/pedidosDoDia'

export const metadata: Metadata = { title: 'Cozinha' }

/** Pedidos em aberto, em letra grande, para ficar no tablet ou na TV da cozinha. */
export default async function Cozinha() {
  const { payload, loja, comoUsuario } = await sessao()
  const agora = new Date()
  const { docs } = await payload.find({
    collection: 'pedidos',
    where: {
      loja: { equals: loja.id },
      status: { in: ['novo', 'preparando', 'pronto'] },
      // Agendamento vai até 7 dias adiante; pedido em aberto mais velho que isso é esquecido.
      createdAt: { greater_than_equal: new Date(agora.getTime() - 8 * 86_400_000).toISOString() },
    },
    sort: 'createdAt',
    depth: 0,
    limit: 200,
    ...comoUsuario,
  })

  const pedidos = docs
    .filter((p) => naCozinha(p.agendadoPara ?? null, agora))
    .map((p) => ({
      id: p.id,
      numero: p.numero,
      status: p.status as 'novo' | 'preparando' | 'pronto',
      createdAt: p.createdAt,
      nome: p.nome,
      modo: p.modo,
      agendadoPara: p.agendadoPara ?? null,
      observacoes: p.observacoes ?? '',
      itens: (p.itens ?? []).map((i) => ({ nome: i.nome, quantidade: i.quantidade, opcoes: i.opcoes ?? '' })),
    }))

  return <TelaCozinha pedidos={pedidos} />
}
