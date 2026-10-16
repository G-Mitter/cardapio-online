import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { type Linha, NovoPedido } from '@/components/painel/NovoPedido'
import { gruposDoProduto } from '@/lib/opcoes'
import { sessao } from '@/lib/painel'

export const metadata: Metadata = { title: 'Editar pedido' }

/** Acrescentar ou tirar itens de um pedido em andamento; depois, reenviar ao cliente no WhatsApp. */
export default async function EditarPedido({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { payload, loja, comoUsuario } = await sessao('pedidos')
  const { docs } = await payload.find({
    collection: 'pedidos',
    where: { id: { equals: Number(id) }, loja: { equals: loja.id } },
    limit: 1,
    depth: 0,
    ...comoUsuario,
  })
  const pedido = docs[0]
  if (!pedido || pedido.mesa || pedido.status === 'entregue' || pedido.status === 'cancelado') notFound()

  const { docs: produtos } = await payload.find({
    collection: 'produtos',
    where: { loja: { equals: loja.id } },
    sort: 'ordem',
    limit: 0,
    depth: 0,
    ...comoUsuario,
  })
  const jaNoPedido = new Set(pedido.itens.map((i) => i.produto))
  const lista = produtos
    .filter((p) => !p.esgotado || jaNoPedido.has(p.id))
    .map((p) => ({ id: p.id, nome: p.nome, preco: p.preco, opcoes: gruposDoProduto(p.opcoes) }))

  const linhas: Linha[] = []
  for (const i of pedido.itens) {
    const produto = lista.find((p) => p.id === i.produto)
    // Produto apagado depois do pedido: não dá para recalcular, então não se edita.
    if (!produto) notFound()
    const escolhas = (i.escolhas ?? {}) as Linha['escolhas']
    linhas.push({
      chave: `${i.produto}:${JSON.stringify(Object.entries(escolhas).filter(([, v]) => v.length).sort())}`,
      produto,
      escolhas,
      descricao: i.opcoes ?? '',
      preco: i.precoUnitario,
      quantidade: i.quantidade,
    })
  }

  return (
    <>
      <h1>Editar pedido nº {pedido.numero}</h1>
      <NovoPedido
        produtos={lista}
        fazEntrega={false}
        aceitaRetirada={false}
        bairros={[]}
        taxaEntrega={0}
        pagamentos={[]}
        edicao={{
          id: pedido.id,
          numero: pedido.numero,
          linhas,
          observacoes: pedido.observacoes ?? '',
          taxa: pedido.taxa,
          desconto: pedido.desconto ?? 0,
        }}
      />
    </>
  )
}
