'use client'

import Image from 'next/image'
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
  fotoDe,
  aoPedirDeNovo,
}: {
  pedidos: PedidoLocal[]
  ocupado: boolean
  /** Foto do produto no cardápio de agora (null se não tiver ou saiu do cardápio). */
  fotoDe: (produto: number) => string | null
  aoPedirDeNovo: (p: PedidoLocal) => void
}) {
  if (!pedidos.length) return null
  return (
    <section className="seus-pedidos" aria-labelledby="titulo-seus-pedidos">
      <h2 id="titulo-seus-pedidos">Peça de novo</h2>
      <div className="seus-pedidos__linha">
        {pedidos.map((p) => (
          <div key={p.numero} className="seus-pedidos__item">
            <div className="seus-pedidos__fotos">
              {p.itens.slice(0, 3).map((i) => {
                const foto = fotoDe(i.produto)
                return (
                  <span key={i.produto} className="foto" aria-hidden>
                    {foto ? <Image src={foto} alt="" fill sizes="64px" /> : i.nome[0]}
                  </span>
                )
              })}
            </div>
            <small>{p.itens.map((i) => `${i.quantidade}× ${i.nome}`).join(', ')}</small>
            <b>
              {new Date(p.em).toLocaleDateString('pt-BR')} · {brl(p.total)}
            </b>
            {p.modo === 'retirada' && p.codigoRetirada && (
              <small>
                Código de retirada <strong>{p.codigoRetirada}</strong>
              </small>
            )}
            <button type="button" className="secundario" disabled={ocupado} onClick={() => aoPedirDeNovo(p)}>
              Adicionar ao carrinho
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
