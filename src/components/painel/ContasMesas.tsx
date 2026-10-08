'use client'

import { FecharConta } from '@/components/painel/FecharConta'
import { brl, type FormaPagamento } from '@/lib/pedido'

type Conta = {
  mesa: string
  total: number
  /** O cliente tocou em "Pedir a conta" no QR Code. */
  pediuConta: boolean
  pedidos: { id: number; numero: number; itens: { nome: string; quantidade: number; opcoes: string }[] }[]
}

export function ContasMesas({
  contas,
  taxaPct,
  formas,
}: {
  contas: Conta[]
  taxaPct: number
  formas: { value: FormaPagamento; label: string }[]
}) {
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
            <FecharConta mesa={c.mesa} subtotal={c.total} taxaPct={taxaPct} formas={formas} />
          </footer>
        </article>
      ))}
    </div>
  )
}
