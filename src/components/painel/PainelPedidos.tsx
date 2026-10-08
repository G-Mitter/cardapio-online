'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useOptimistic, useTransition } from 'react'

import { brl } from '@/lib/pedido'
import { PROXIMO, ROTULO, type Status } from '@/lib/pedidosDoDia'

import { mudarStatus } from '@/app/(frontend)/painel/actions'

export type PedidoView = {
  id: number
  numero: number
  status: Status
  createdAt: string
  nome: string
  telefone: string
  modo: 'entrega' | 'retirada'
  endereco: string
  observacoes: string
  total: number
  itens: { nome: string; quantidade: number }[]
}

/** Busca pedidos novos sozinha a cada 20 segundos, sem recarregar a página. */
const ATUALIZA_MS = 20_000

const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })

export function PainelPedidos({ pedidos }: { pedidos: PedidoView[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  // A troca de status aparece na hora; se o servidor recusar, a próxima atualização desfaz.
  const [lista, trocar] = useOptimistic(
    pedidos,
    (atual, { id, status }: { id: number; status: Status }) =>
      atual.map((p) => (p.id === id ? { ...p, status } : p)),
  )

  useEffect(() => {
    const t = setInterval(() => router.refresh(), ATUALIZA_MS)
    return () => clearInterval(t)
  }, [router])

  function mudar(id: number, status: Status) {
    startTransition(async () => {
      trocar({ id, status })
      await mudarStatus(id, status)
      router.refresh()
    })
  }

  if (!lista.length) {
    return <p className="pedidos-vazio">Nenhum pedido hoje ainda. A lista se atualiza sozinha.</p>
  }

  const abertos = lista.filter((p) => PROXIMO[p.status]).length
  return (
    <div className="pedidos">
      <p>
        {abertos} em aberto · {lista.length} hoje. A lista se atualiza sozinha.
      </p>
      {lista.map((p) => {
        const proximo = PROXIMO[p.status]
        return (
          <article key={p.id} className={`pedido pedido--${p.status}`}>
            <header>
              <b>Nº {p.numero}</b>
              <span>{hora(p.createdAt)}</span>
              <span className="pedido__status">{ROTULO[p.status]}</span>
            </header>
            <div>
              <b>{p.nome}</b>
              {p.telefone && (
                <>
                  {' '}
                  · <a href={`tel:${p.telefone}`}>{p.telefone}</a>
                </>
              )}{' '}
              · {p.modo === 'entrega' ? `Entrega: ${p.endereco}` : 'Retirada'}
            </div>
            <ul>
              {p.itens.map((i, n) => (
                <li key={n}>
                  {i.quantidade}× {i.nome}
                </li>
              ))}
            </ul>
            {p.observacoes && <div className="pedido__obs">Obs.: {p.observacoes}</div>}
            <footer>
              <b>{brl(p.total)}</b>
              <div className="pedido__acoes">
                {proximo && (
                  <button type="button" className="botao" onClick={() => mudar(p.id, proximo)}>
                    {ROTULO[proximo]}
                  </button>
                )}
                {p.status !== 'cancelado' && p.status !== 'entregue' && (
                  <button
                    type="button"
                    className="botao secundario"
                    onClick={() => mudar(p.id, 'cancelado')}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </footer>
          </article>
        )
      })}
    </div>
  )
}
