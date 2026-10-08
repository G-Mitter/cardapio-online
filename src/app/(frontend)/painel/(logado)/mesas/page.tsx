import type { Metadata } from 'next'
import Link from 'next/link'

import { ContasMesas } from '@/components/painel/ContasMesas'
import { agruparMesas } from '@/lib/mesas'
import { sessao } from '@/lib/painel'

export const metadata: Metadata = { title: 'Mesas' }

/** Contas abertas por mesa: tudo o que cada mesa pediu, com "Fechar conta". */
export default async function Mesas() {
  const { payload, loja, comoUsuario } = await sessao()
  const { docs } = await payload.find({
    collection: 'pedidos',
    where: {
      loja: { equals: loja.id },
      mesa: { exists: true },
      contaFechada: { not_equals: true },
      status: { not_equals: 'cancelado' },
    },
    sort: 'createdAt',
    depth: 0,
    limit: 500,
    ...comoUsuario,
  })

  // Quem pediu a conta vai para o começo da lista.
  const contas = agruparMesas(
    docs.map((p) => ({
      id: p.id,
      numero: p.numero,
      mesa: p.mesa ?? '',
      total: p.total,
      pediuConta: p.pediuConta === true,
      itens: (p.itens ?? []).map((i) => ({ nome: i.nome, quantidade: i.quantidade, opcoes: i.opcoes ?? '' })),
    })),
  )
    .map((c) => ({ ...c, pediuConta: c.pedidos.some((p) => p.pediuConta) }))
    .sort((a, b) => Number(b.pediuConta) - Number(a.pediuConta))

  return (
    <>
      <div className="titulo">
        <h1>Mesas</h1>
        <Link href="/painel/mesas/qr" className="botao secundario">
          Imprimir QR Codes
        </Link>
      </div>
      <ContasMesas contas={contas} />
    </>
  )
}
