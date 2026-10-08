import type { Metadata } from 'next'

import { NovoPedido } from '@/components/painel/NovoPedido'
import { gruposDoProduto } from '@/lib/opcoes'
import { sessao } from '@/lib/painel'
import { FORMAS_PAGAMENTO } from '@/lib/pedido'

export const metadata: Metadata = { title: 'Novo pedido' }

/** Pedido lançado pela loja, no balcão ou por telefone. */
export default async function NovoPedidoPagina() {
  const { payload, loja, comoUsuario } = await sessao()
  const produtos = await payload.find({
    collection: 'produtos',
    where: { loja: { equals: loja.id } },
    sort: 'ordem',
    limit: 0,
    depth: 0,
    ...comoUsuario,
  })

  return (
    <>
      <h1>Novo pedido</h1>
      <NovoPedido
        produtos={produtos.docs
          .filter((p) => !p.esgotado)
          .map((p) => ({ id: p.id, nome: p.nome, preco: p.preco, opcoes: gruposDoProduto(p.opcoes) }))}
        fazEntrega={loja.fazEntrega !== false}
        aceitaRetirada={loja.aceitaRetirada !== false}
        bairros={(loja.bairros ?? []).map((b) => ({ nome: b.nome, taxa: b.taxa }))}
        taxaEntrega={loja.taxaEntrega ?? 0}
        pagamentos={FORMAS_PAGAMENTO.filter((f) => loja.formasPagamento?.includes(f.value))}
      />
    </>
  )
}
