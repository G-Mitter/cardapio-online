import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { FecharConta } from '@/components/painel/FecharConta'
import { NovoPedido } from '@/components/painel/NovoPedido'
import { gruposDoProduto } from '@/lib/opcoes'
import { lerMesas } from '@/lib/mesas'
import { sessaoGarcom } from '@/lib/painel'
import { brl, FORMAS_PAGAMENTO } from '@/lib/pedido'

export const metadata: Metadata = { title: 'Mesa' }

/** Uma mesa: o que já pediu e o lançamento de mais itens. É também para onde o QR da mesa leva o garçom. */
export default async function MesaDoGarcom({ params }: { params: Promise<{ mesa: string }> }) {
  const mesa = decodeURIComponent((await params).mesa)
  const { payload, loja, comoUsuario } = await sessaoGarcom()
  const mesas = lerMesas(loja.mesas ?? '')
  if (!mesas.ok || !mesas.mesas.includes(mesa)) notFound()

  const [pedidos, produtos] = await Promise.all([
    payload.find({
      collection: 'pedidos',
      where: {
        loja: { equals: loja.id },
        mesa: { equals: mesa },
        contaFechada: { not_equals: true },
        status: { not_equals: 'cancelado' },
      },
      sort: 'createdAt',
      depth: 0,
      limit: 100,
      ...comoUsuario,
    }),
    payload.find({
      collection: 'produtos',
      where: { loja: { equals: loja.id } },
      sort: 'ordem',
      limit: 0,
      depth: 0,
      ...comoUsuario,
    }),
  ])
  const total = pedidos.docs.reduce((s, p) => s + Math.round(p.total * 100), 0) / 100

  return (
    <>
      <p>
        <Link href="/painel/garcom">← Mesas</Link>
      </p>
      <h1>Mesa {mesa}</h1>
      {pedidos.docs.length > 0 && (
        <>
          <ul className="lista">
            {pedidos.docs.flatMap((p) =>
              (p.itens ?? []).map((i, n) => (
                <li key={`${p.id}-${n}`}>
                  <span className="lista__nome">
                    {i.quantidade}× {i.nome}
                    {i.opcoes && <span> ({i.opcoes})</span>}
                  </span>
                </li>
              )),
            )}
          </ul>
          <p>
            <b>Conta até agora: {brl(total)}</b>
          </p>
          <FecharConta
            mesa={mesa}
            subtotal={total}
            taxaPct={loja.taxaServico ?? 0}
            formas={FORMAS_PAGAMENTO.filter((f) => loja.formasPagamento?.includes(f.value))}
          />
        </>
      )}
      <NovoPedido
        mesa={mesa}
        produtos={produtos.docs
          .filter((p) => !p.esgotado)
          .map((p) => ({ id: p.id, nome: p.nome, preco: p.preco, opcoes: gruposDoProduto(p.opcoes) }))}
        fazEntrega={false}
        aceitaRetirada={false}
        bairros={[]}
        taxaEntrega={0}
        pagamentos={[]}
      />
    </>
  )
}
