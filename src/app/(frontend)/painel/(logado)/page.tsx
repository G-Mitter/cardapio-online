import type { Metadata } from 'next'

import { PainelPedidos } from '@/components/painel/PainelPedidos'
import { sessao } from '@/lib/painel'
import { inicioDoDia, ordenar } from '@/lib/pedidosDoDia'

export const metadata: Metadata = { title: 'Pedidos de hoje' }

/** Tela inicial do painel: os pedidos do dia, com troca de status em um toque. */
export default async function Pedidos() {
  const { payload, loja, comoUsuario } = await sessao()
  const { docs } = await payload.find({
    collection: 'pedidos',
    where: { loja: { equals: loja.id }, createdAt: { greater_than_equal: inicioDoDia() } },
    depth: 0,
    limit: 500,
    ...comoUsuario,
  })

  const pedidos = ordenar(
    docs.map((p) => ({
      id: p.id,
      numero: p.numero,
      status: p.status,
      createdAt: p.createdAt,
      nome: p.nome,
      telefone: p.telefone ?? '',
      modo: p.modo,
      endereco: p.endereco ?? '',
      observacoes: p.observacoes ?? '',
      pagamento: p.pagamento ?? '',
      trocoPara: p.trocoPara ?? null,
      cpf: p.cpf ?? '',
      total: p.total,
      itens: (p.itens ?? []).map((i) => ({ nome: i.nome, quantidade: i.quantidade })),
    })),
  )

  return (
    <>
      <h1>Pedidos de hoje</h1>
      <PainelPedidos pedidos={pedidos} />
    </>
  )
}
