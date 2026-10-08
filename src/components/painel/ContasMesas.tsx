'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

import { brl } from '@/lib/pedido'

import { fecharConta } from '@/app/(frontend)/painel/actions'

type Conta = {
  mesa: string
  total: number
  /** O cliente tocou em "Pedir a conta" no QR Code. */
  pediuConta: boolean
  pedidos: { id: number; numero: number; itens: { nome: string; quantidade: number; opcoes: string }[] }[]
}

export function ContasMesas({ contas }: { contas: Conta[] }) {
  const router = useRouter()
  const [fechando, startTransition] = useTransition()

  if (!contas.length) return <p className="vazio">Nenhuma mesa com conta aberta.</p>
  return (
    <div className="pedidos">
      {contas.map((c) => (
        <article key={c.mesa} className="pedido">
          <header>
            <b>Mesa {c.mesa}</b>
            {c.pediuConta && <span className="selo">Pediu a conta</span>}
            <span>
              {c.pedidos.length} {c.pedidos.length === 1 ? 'pedido' : 'pedidos'}
            </span>
          </header>
          {c.pedidos.map((p) => (
            <div key={p.id}>
              <small>Pedido nº {p.numero}</small>
              <ul>
                {p.itens.map((i, n) => (
                  <li key={n}>
                    {i.quantidade}× {i.nome}
                    {i.opcoes && <small> ({i.opcoes})</small>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <footer>
            <b>Total: {brl(c.total)}</b>
            <div className="pedido__acoes">
              <button
                type="button"
                className="botao"
                disabled={fechando}
                onClick={() =>
                  startTransition(async () => {
                    await fecharConta(c.mesa)
                    router.refresh()
                  })
                }
              >
                Fechar conta
              </button>
            </div>
          </footer>
        </article>
      ))}
    </div>
  )
}
