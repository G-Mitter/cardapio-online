import type { Metadata } from 'next'

import { agruparMesas } from '@/lib/mesas'
import { brl } from '@/lib/pedido'
import { sessaoGarcom } from '@/lib/painel'

export const metadata: Metadata = { title: 'Mesas' }

/** Tela do garçom: as mesas com conta aberta. Lançar pedidos e fechar conta vêm nas próximas etapas. */
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
    sort: 'createdAt',
    depth: 0,
    limit: 500,
    ...comoUsuario,
  })
  const contas = agruparMesas(docs.map((p) => ({ id: p.id, numero: p.numero, mesa: p.mesa ?? '', total: p.total })))

  return (
    <>
      <h1>Olá, {user.nome ?? 'garçom'}</h1>
      {!contas.length && <p className="vazio">Nenhuma mesa com conta aberta.</p>}
      <ul className="lista">
        {contas.map((c) => (
          <li key={c.mesa}>
            <div className="lista__nome">
              <b>Mesa {c.mesa}</b>
              <span>
                {c.pedidos.length} {c.pedidos.length === 1 ? 'pedido' : 'pedidos'} · {brl(c.total)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
