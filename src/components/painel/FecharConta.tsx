'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { fecharPagamento, totalDaConta, valorPorPessoa } from '@/lib/conta'
import { brl, type FormaPagamento } from '@/lib/pedido'
import { lerPreco } from '@/lib/planilha'

import { Contador } from './Contador'

import { fecharContaDaMesa } from '@/app/(frontend)/painel/actions'

/** "Fechar conta" de uma mesa: taxa de serviço opcional, dividir, e como a mesa pagou (uma ou mais formas). */
export function FecharConta({
  mesa,
  subtotal,
  taxaPct,
  formas,
  caixas = [],
  caixaInicial = null,
}: {
  mesa: string
  subtotal: number
  taxaPct: number
  formas: { value: FormaPagamento; label: string }[]
  /** Caixas abertos; com mais de um, quem fecha a conta diz em qual o pagamento entrou. */
  caixas?: { id: number; nome: string }[]
  caixaInicial?: number | null
}) {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [cobrar, setCobrar] = useState(true)
  const [pessoas, setPessoas] = useState(1)
  const [valores, setValores] = useState<Record<string, string>>({})
  const [caixa, setCaixa] = useState(caixaInicial ? String(caixaInicial) : '')
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
      <Contador rotulo="Dividir por (pessoas)" inicial={1} min={1} max={50} aoMudar={setPessoas} />
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
      {caixas.length > 1 && (
        <label className="campo">
          Caixa que recebeu
          <select value={caixa} onChange={(e) => setCaixa(e.target.value)}>
            <option value="">Escolha o caixa</option>
            {caixas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
      )}
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
          disabled={fechando || !pago.ok || (caixas.length > 1 && !caixa)}
          onClick={() =>
            startTransition(async () => {
              const r = await fecharContaDaMesa(mesa, cobrar, recebido, caixa ? Number(caixa) : null)
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
