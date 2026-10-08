'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { fecharPagamento, totalDaConta, valorPorPessoa } from '@/lib/conta'
import { brl, type FormaPagamento } from '@/lib/pedido'
import { lerPreco } from '@/lib/planilha'

import { fecharContaDaMesa } from '@/app/(frontend)/painel/actions'

/** "Fechar conta" de uma mesa: taxa de serviço opcional, dividir, e como a mesa pagou (uma ou mais formas). */
export function FecharConta({
  mesa,
  subtotal,
  taxaPct,
  formas,
}: {
  mesa: string
  subtotal: number
  taxaPct: number
  formas: { value: FormaPagamento; label: string }[]
}) {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [cobrar, setCobrar] = useState(true)
  const [pessoas, setPessoas] = useState(1)
  const [valores, setValores] = useState<Record<string, string>>({})
  const [erro, setErro] = useState('')
  const [fechando, startTransition] = useTransition()

  if (!aberto) {
    return (
      <button type="button" className="botao" onClick={() => setAberto(true)}>
        Fechar conta
      </button>
    )
  }

  const { taxaServico, total } = totalDaConta(subtotal, taxaPct, cobrar)
  const recebido = formas.map((f) => ({ forma: f.value, valor: lerPreco(valores[f.value]?.trim() || '0') ?? NaN }))
  const pago = fecharPagamento(total, recebido)

  return (
    <div className="fechar-conta">
      <p>Subtotal: {brl(subtotal)}</p>
      {taxaPct > 0 && (
        <label className="marcar">
          <input type="checkbox" checked={cobrar} onChange={(e) => setCobrar(e.target.checked)} />
          Taxa de serviço de {taxaPct}% (opcional): {brl(totalDaConta(subtotal, taxaPct, true).taxaServico)}
        </label>
      )}
      <p>
        <b>Total: {brl(total)}</b>
        {taxaServico > 0 && <small> (com {brl(taxaServico)} de serviço)</small>}
      </p>
      <label className="campo curto">
        Dividir por (pessoas)
        <input type="number" min={1} max={50} value={pessoas} onChange={(e) => setPessoas(Math.max(1, Number(e.target.value) || 1))} />
      </label>
      {pessoas > 1 && <p>{brl(valorPorPessoa(total, pessoas))} por pessoa</p>}

      <h3>Como pagou</h3>
      <div className="linha">
        {formas.map((f) => (
          <label key={f.value} className="campo">
            {f.label} (R$)
            <input
              inputMode="decimal"
              value={valores[f.value] ?? ''}
              onChange={(e) => setValores((v) => ({ ...v, [f.value]: e.target.value }))}
              placeholder="0,00"
              autoComplete="off"
            />
          </label>
        ))}
      </div>
      {pago.ok ? (
        <p>{pago.troco > 0 ? <b>Troco: {brl(pago.troco)}</b> : 'Valor confere.'}</p>
      ) : (
        <p className="aviso-dados">{pago.erro}</p>
      )}
      {erro && (
        <p role="alert" className="erro">
          {erro}
        </p>
      )}
      <div className="pedido__acoes">
        <button
          type="button"
          className="botao"
          disabled={fechando || !pago.ok}
          onClick={() =>
            startTransition(async () => {
              const r = await fecharContaDaMesa(mesa, cobrar, recebido)
              if (r.ok) router.refresh()
              else setErro(r.erro)
            })
          }
        >
          {fechando ? 'Fechando…' : 'Confirmar pagamento'}
        </button>
        <button type="button" className="botao secundario" onClick={() => setAberto(false)}>
          Voltar
        </button>
      </div>
    </div>
  )
}
