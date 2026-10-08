import type { Metadata } from 'next'
import Link from 'next/link'

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

  const { docs: entregadores } = await payload.find({
    collection: 'entregadores',
    where: { loja: { equals: loja.id }, ativo: { not_equals: false } },
    sort: 'nome',
    depth: 0,
    limit: 0,
    ...comoUsuario,
  })
  const nomeDoEntregador = new Map(entregadores.map((e) => [e.id, e.nome]))

  const pedidos = ordenar(
    docs.map((p) => ({
      id: p.id,
      numero: p.numero,
      status: p.status,
      createdAt: p.createdAt,
      nome: p.nome,
      telefone: p.telefone ?? '',
      modo: p.modo,
      balcao: Boolean(p.balcao),
      mesa: p.mesa ?? '',
      endereco: p.endereco ?? '',
      entregadorId: typeof p.entregador === 'number' ? p.entregador : null,
      entregador: typeof p.entregador === 'number' ? (nomeDoEntregador.get(p.entregador) ?? '') : '',
      observacoes: p.observacoes ?? '',
      agendadoPara: p.agendadoPara ?? null,
      pagamento: p.pagamento ?? '',
      trocoPara: p.trocoPara ?? null,
      cpf: p.cpf ?? '',
      // O código em si não vai para a tela: quem mostra é o cliente.
      pedeCodigo: p.modo === 'retirada' && Boolean(p.codigoRetirada),
      total: p.total,
      itens: (p.itens ?? []).map((i) => ({ nome: i.nome, quantidade: i.quantidade, opcoes: i.opcoes ?? '' })),
    })),
  )

  return (
    <>
      <div className="titulo">
        <h1>Pedidos de hoje</h1>
        <Link href="/painel/novo-pedido" className="botao">
          Novo pedido
        </Link>
      </div>
      <PainelPedidos
        pedidos={pedidos}
        loja={loja.nome}
        entregadores={entregadores.map((e) => ({ id: e.id, nome: e.nome, whatsapp: e.whatsapp }))}
      />
    </>
  )
}
