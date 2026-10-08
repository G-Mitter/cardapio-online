'use client'

import { useState, useTransition } from 'react'

import { MAQUININHAS } from '@/lib/maquininha'
import { FotoMaquininha } from './FotoMaquininha'
import { brl } from '@/lib/pedido'

import { conferirMaquininha } from '@/app/(frontend)/painel/actions'

type Retorno = Awaited<ReturnType<typeof conferirMaquininha>>

const dataBr = (d: string) => d.split('-').reverse().join('/')
const hora = (ms: number) =>
  new Date(ms).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })

/** Envia o relatório da maquininha (arquivo ou texto colado) e mostra o que confere e o que não. */
export function ConferirMaquininha() {
  const [texto, setTexto] = useState('')
  const [abrirCsv, setAbrirCsv] = useState(false)
  const [lancar, setLancar] = useState(false)
  const [retorno, setRetorno] = useState<Retorno | null>(null)
  const [conferindo, startTransition] = useTransition()

  const r = retorno?.erro === null ? retorno : null

  return (
    <>
      <p>Veja se o que a maquininha recebeu bate com os pedidos pagos em cartão. A foto e o arquivo não ficam guardados.</p>
      <FotoMaquininha
        onUsar={(csv) => {
          setTexto(csv)
          setAbrirCsv(true)
        }}
      />
      <details open={abrirCsv} onToggle={(e) => setAbrirCsv(e.currentTarget.open)}>
        <summary>Tenho o arquivo da maquininha (.csv) ou quero ver as vendas em texto</summary>
      <label className="campo">
        Arquivo da maquininha
        <input
          type="file"
          accept=".csv,text/csv,text/plain"
          onChange={async (e) => {
            const f = e.target.files?.[0]
            if (f) setTexto(await f.text())
          }}
        />
      </label>
      <div className="campo">
        <label htmlFor="relatorio">Ou cole o relatório aqui</label>
        <textarea id="relatorio" rows={6} value={texto} onChange={(e) => setTexto(e.target.value)} />
        {!texto.trim() && (
          <div className="linha">
            {MAQUININHAS.map((m) => (
              <button key={m.nome} type="button" className="botao secundario" onClick={() => setTexto(m.exemplo)}>
                Colar exemplo {m.nome}
              </button>
            ))}
          </div>
        )}
        <small>Reconhecemos data, hora, valor, débito/crédito, bandeira, taxa, valor líquido e previsão de pagamento.</small>
      </div>
      </details>
      <label>
        <input type="checkbox" checked={lancar} onChange={(e) => setLancar(e.target.checked)} /> Lançar o que a maquininha vai
        pagar em &quot;A receber&quot;, na data prevista
      </label>
      <button
        className="botao"
        disabled={conferindo || !texto.trim()}
        onClick={() => startTransition(async () => setRetorno(await conferirMaquininha(texto, lancar)))}
      >
        {conferindo ? 'Conferindo…' : 'Conferir'}
      </button>

      {retorno?.erro && <p className="erro">{retorno.erro}</p>}

      {r && (
        <>
          <h2>Resultado</h2>
          <p>
            Vendido no cartão: <b>{brl(r.resultado.totais.vendido)}</b> · Pedidos em cartão: <b>{brl(r.resultado.totais.pedidos)}</b>
          </p>
          {r.temTaxa ? (
            <p>
              A maquininha vai pagar <b>{brl(r.resultado.totais.recebido)}</b> · Taxa paga: <b>{brl(r.resultado.totais.taxa)}</b> (
              {String(r.resultado.totais.taxaEfetiva).replace('.', ',')}% das vendas)
            </p>
          ) : (
            <p className="vazio">O relatório não tem taxa nem valor líquido, então não dá para calcular a taxa paga.</p>
          )}
          {r.ignoradas > 0 && <p>{r.ignoradas} venda(s) em Pix na maquininha ficaram de fora.</p>}
          {r.semPrevisao && <p className="erro">O relatório não traz a data prevista de pagamento: nada foi lançado em &quot;A receber&quot;.</p>}
          {r.lancados > 0 && <p>{r.lancados} conta(s) a receber lançada(s) em Financeiro.</p>}
          {r.erros.length > 0 && (
            <ul className="erro">
              {r.erros.map((e) => (
                <li key={e.linha}>
                  Linha {e.linha}: {e.motivo}
                </li>
              ))}
            </ul>
          )}

          <h3>Confere ({r.resultado.confere.length})</h3>
          <ul className="lista">
            {r.resultado.confere.map(({ venda, pagamento }) => (
              <li key={venda.linha}>
                <div className="lista__nome">
                  <b>{brl(venda.valor)}</b>
                  <span>
                    {dataBr(venda.dia)} {venda.quando && hora(venda.quando)} · {venda.tipo}
                    {venda.bandeira && ` ${venda.bandeira}`} · {pagamento.rotulo}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <h3>Na maquininha, sem pedido ({r.resultado.soNaMaquininha.length})</h3>
          {r.resultado.soNaMaquininha.length > 0 && (
            <p>Venda que passou no cartão sem pedido finalizado: confira se o pedido ficou sem finalizar ou foi pago em outra forma.</p>
          )}
          <ul className="lista">
            {r.resultado.soNaMaquininha.map((v) => (
              <li key={v.linha}>
                <div className="lista__nome">
                  <b>{brl(v.valor)}</b>
                  <span>
                    {dataBr(v.dia)} {v.quando && hora(v.quando)} · {v.tipo}
                    {v.bandeira && ` ${v.bandeira}`} · linha {v.linha}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <h3>Pedido em cartão que não está na maquininha ({r.resultado.soNoPedido.length})</h3>
          {r.resultado.soNoPedido.length > 0 && (
            <p>O pedido diz cartão, mas a maquininha não registrou: pode ter sido pago em dinheiro ou Pix. Corrija a forma no pedido.</p>
          )}
          <ul className="lista">
            {r.resultado.soNoPedido.map((p) => (
              <li key={p.id}>
                <div className="lista__nome">
                  <b>{brl(p.valor)}</b>
                  <span>
                    {p.rotulo} · {dataBr(new Date(p.de - 3 * 3_600_000).toISOString().slice(0, 10))} {hora(p.de)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
