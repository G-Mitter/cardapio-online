'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'

import { brl } from '@/lib/pedido'
import { comPedidoNovo, lerPedidosLocais, type PedidoLocal } from '@/lib/pedidosLocais'

const AVISO = 'pedidos-locais'

function inscrever(aviso: () => void) {
  window.addEventListener('storage', aviso)
  window.addEventListener(AVISO, aviso)
  return () => {
    window.removeEventListener('storage', aviso)
    window.removeEventListener(AVISO, aviso)
  }
}

/** Últimos pedidos feitos neste aparelho, nesta loja. Só localStorage: nada vai para o servidor. */
export function usePedidosLocais(loja: string) {
  const chave = `cardapio-pedidos:${loja}`
  const bruto = useSyncExternalStore(
    inscrever,
    () => {
      try {
        return localStorage.getItem(chave)
      } catch {
        return null
      }
    },
    () => null,
  )
  const pedidos = useMemo(() => lerPedidosLocais(bruto), [bruto])
  const guardar = useCallback(
    (novo: PedidoLocal) => {
      try {
        localStorage.setItem(chave, JSON.stringify(comPedidoNovo(lerPedidosLocais(localStorage.getItem(chave)), novo)))
        window.dispatchEvent(new Event(AVISO))
      } catch {}
    },
    [chave],
  )
  return { pedidos, guardar }
}

export function SeusPedidos({
  pedidos,
  ocupado,
  aoPedirDeNovo,
}: {
  pedidos: PedidoLocal[]
  ocupado: boolean
  aoPedirDeNovo: (p: PedidoLocal) => void
}) {
  if (!pedidos.length) return null
  return (
    <section className="seus-pedidos" aria-labelledby="titulo-seus-pedidos">
      <h2 id="titulo-seus-pedidos">Seus pedidos</h2>
      {pedidos.map((p) => (
        <div key={p.numero} className="seus-pedidos__item">
          <div>
            <b>
              Pedido nº {p.numero} · {new Date(p.em).toLocaleDateString('pt-BR')} · {brl(p.total)}
            </b>
            <small>{p.itens.map((i) => `${i.quantidade}× ${i.nome}`).join(', ')}</small>
            {p.modo === 'retirada' && p.codigoRetirada && (
              <small>
                Código de retirada <strong>{p.codigoRetirada}</strong>
              </small>
            )}
          </div>
          <button type="button" className="secundario" disabled={ocupado} onClick={() => aoPedirDeNovo(p)}>
            Pedir de novo
          </button>
        </div>
      ))}
    </section>
  )
}
