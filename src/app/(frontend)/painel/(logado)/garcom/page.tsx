import type { Metadata } from 'next'
import Link from 'next/link'

import { agruparMesas, lerMesas } from '@/lib/mesas'
import { brl } from '@/lib/pedido'
import { sessaoGarcom } from '@/lib/painel'

export const metadata: Metadata = { title: 'Mesas' }

/** Tela do garçom: todas as mesas, Livre ou com conta aberta. Toque na mesa para lançar pedidos. */
export default async function TelaDoGarcom() {
  const { payload, loja, user, comoUsuario } = await sessaoGarcom()
  const { docs } = await payload.find({
    collection: 'pedidos',
    where: {
      loja: { equals: loja.id },
      mesa: { exists: true },
      contaFechada: { not_equals: true },
      status: { not_equals: 'cancelado' },
    },
    depth: 0,
    limit: 500,
    ...comoUsuario,
  })
  const contas = new Map(
    agruparMesas(docs.map((p) => ({ id: p.id, numero: p.numero, mesa: p.mesa ?? '', total: p.total }))).map((c) => [c.mesa, c]),
  )
  const mesas = lerMesas(loja.mesas ?? '')

  return (
    <>
      <h1>Olá, {user.nome ?? 'garçom'}</h1>
      {!mesas.ok || !mesas.mesas.length ? (
        <p className="vazio">A loja ainda não cadastrou as mesas.</p>
      ) : (
        <ul className="lista">
          {mesas.mesas.map((m) => {
            const c = contas.get(m)
            return (
              <li key={m}>
                <Link className="lista__nome" href={`/painel/garcom/${encodeURIComponent(m)}`}>
                  <b>Mesa {m}</b>
                  <span>{c ? `Conta aberta · ${brl(c.total)}` : 'Livre'}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
