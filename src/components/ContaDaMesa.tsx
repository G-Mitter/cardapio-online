'use client'

import { useEffect, useState, useSyncExternalStore, useTransition } from 'react'

import { type ContaDaMesa as Conta, contaDaMesa, pedirContaDaMesa } from '@/app/(frontend)/actions'
import { brl } from '@/lib/pedido'

const TRES_HORAS = 3 * 60 * 60 * 1000
const chave = (loja: string) => `mesa:${loja}`

/** Mesa guardada neste celular (por 3 horas), para voltar a ela sem ler o QR Code de novo. */
function mesaGuardada(loja: string): string {
  try {
    const { mesa, em } = JSON.parse(localStorage.getItem(chave(loja)) ?? '{}')
    return mesa && Date.now() - em < TRES_HORAS ? String(mesa) : ''
  } catch {
    return ''
  }
}

/**
 * O que a mesa já pediu, o total até agora e o botão "Pedir a conta". Sem mesa na URL, mostra só o
 * atalho para a mesa guardada neste celular. `atualizar` muda quando o cliente faz um pedido novo.
 */
export function ContaDaMesa({ loja, mesa, atualizar }: { loja: string; mesa: string | null; atualizar?: number }) {
  const [conta, setConta] = useState<Conta | null>(null)
  const [pedida, setPedida] = useState(false)
  const [enviando, startTransition] = useTransition()
  const guardada = useSyncExternalStore(
    () => () => {},
    () => (mesa ? '' : mesaGuardada(loja)),
    () => '',
  )

  useEffect(() => {
    if (!mesa) return
    try {
      localStorage.setItem(chave(loja), JSON.stringify({ mesa, em: Date.now() }))
    } catch {}
    contaDaMesa(loja, mesa).then(setConta)
  }, [loja, mesa, atualizar])

  if (!mesa) {
    return guardada ? (
      <p className="conta-mesa">
        <a href={`?mesa=${encodeURIComponent(guardada)}`}>Está na mesa {guardada}? Voltar para a mesa</a>
      </p>
    ) : null
  }
  if (!conta?.itens.length) return null

  return (
    <section className="conta-mesa" aria-label="Conta da mesa">
      <h2>Já pedido na mesa {mesa}</h2>
      <ul>
        {conta.itens.map((i, n) => (
          <li key={n}>
            {i.quantidade}× {i.nome}
            {i.opcoes && <small> ({i.opcoes})</small>}
          </li>
        ))}
      </ul>
      <p>
        <b>Total até agora: {brl(conta.total)}</b>
      </p>
      {conta.pediuConta || pedida ? (
        <p role="status">Conta pedida! A loja já foi avisada e vai até a sua mesa. Dá para pedir mais se quiser.</p>
      ) : (
        <button
          type="button"
          className="enviar"
          disabled={enviando}
          onClick={() =>
            startTransition(async () => {
              const r = await pedirContaDaMesa(loja, mesa)
              setPedida(r.ok)
            })
          }
        >
          Pedir a conta
        </button>
      )}
      <small>O pagamento é feito no caixa.</small>
    </section>
  )
}
