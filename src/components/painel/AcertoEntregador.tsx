'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { calcularAcerto, diferencaDoAcerto, type EntregaParaAcerto } from '@/lib/entregadores'
import { brl } from '@/lib/pedido'
import { lerPreco } from '@/lib/planilha'

import { fazerAcerto } from '@/app/(frontend)/painel/actions'

/** Acerto do dia de um entregador: mostra o que ele deve trazer e a diferença com o que ele entregou. */
export function AcertoEntregador({
  entregador,
  dia,
  entregas,
}: {
  entregador: number
  dia: string
  entregas: EntregaParaAcerto[]
}) {
  const router = useRouter()
  const [troco, setTroco] = useState('')
  const [entregue, setEntregue] = useState('')
  const [descontou, setDescontou] = useState(false)
  const [erro, setErro] = useState('')
  const [salvando, startTransition] = useTransition()

  const c = calcularAcerto(entregas, lerPreco(troco.trim() || '0') ?? 0, descontou)
  const entregueR = entregue.trim() ? lerPreco(entregue.trim()) : null

  return (
    <div className="fechar-conta">
      <p>
        Dinheiro das entregas: <b>{brl(c.dinheiro)}</b>
        {(c.cartao > 0 || c.pix > 0) && (
          <small>
            {' '}
            (à parte, só para conferir: cartão {brl(c.cartao)}, Pix {brl(c.pix)})
          </small>
        )}
      </p>
      <p>Taxas de entrega que a loja deve a ele: {brl(c.taxas)}</p>
      <div className="linha">
        <label className="campo">
          Troco que levou na saída (R$, opcional)
          <input inputMode="decimal" value={troco} onChange={(e) => setTroco(e.target.value)} placeholder="0,00" autoComplete="off" />
        </label>
        <label className="campo">
          Quanto ele entregou (R$)
          <input inputMode="decimal" value={entregue} onChange={(e) => setEntregue(e.target.value)} placeholder="0,00" autoComplete="off" />
        </label>
      </div>
      <label className="marcar">
        <input type="checkbox" checked={descontou} onChange={(e) => setDescontou(e.target.checked)} />
        Ele já descontou a taxa de entrega do dinheiro
      </label>
      <p>
        Deve trazer: <b>{brl(c.esperado)}</b>
        {entregueR !== null && (
          <>
            {' · '}
            <b>{diferencaDoAcerto(entregueR, c.esperado).rotulo}</b>
          </>
        )}
      </p>
      {erro && (
        <p role="alert" className="erro">
          {erro}
        </p>
      )}
      <button
        type="button"
        className="botao"
        disabled={salvando || entregueR === null}
        onClick={() =>
          startTransition(async () => {
            const r = await fazerAcerto(entregador, dia, troco, entregue, descontou)
            if (r.ok) router.refresh()
            else setErro(r.erro)
          })
        }
      >
        {salvando ? 'Guardando…' : 'Acerto feito'}
      </button>
    </div>
  )
}
