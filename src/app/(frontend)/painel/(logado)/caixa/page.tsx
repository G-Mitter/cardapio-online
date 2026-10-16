import type { Metadata } from 'next'

import { Formulario } from '@/components/painel/Formulario'
import { dinheiroEsperado, MOVIMENTOS, rotuloDiferenca } from '@/lib/caixa'
import { vendasDoPeriodo } from '@/lib/caixa-db'
import { brl, rotuloPagamento } from '@/lib/pedido'
import { sessao } from '@/lib/painel'

import { abrirCaixa, fecharCaixa, movimentarCaixa } from '../../actions'

export const metadata: Metadata = { title: 'Caixa' }

const quando = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })

/** Caixa do dia: abrir com o troco, sangria e suprimento, e fechar conferindo o dinheiro da gaveta. */
export default async function Caixa() {
  const { payload, loja, comoUsuario } = await sessao('financeiro')
  const { docs } = await payload.find({
    collection: 'caixas',
    where: { loja: { equals: loja.id } },
    sort: '-abertoEm',
    limit: 11,
    depth: 0,
    ...comoUsuario,
  })
  const aberto = docs.find((c) => !c.fechadoEm)
  const fechados = docs.filter((c) => c.fechadoEm).slice(0, 10)

  const vendas = aberto ? await vendasDoPeriodo(payload, loja.id, aberto.abertoEm, new Date().toISOString()) : null
  const esperado = aberto ? dinheiroEsperado(aberto.trocoInicial, vendas?.get('dinheiro') ?? 0, aberto.movimentos ?? []) : 0

  return (
    <>
      <h1>Caixa</h1>

      {!aberto && (
        <>
          <p>Nenhum caixa aberto. Abra o caixa com o troco que está na gaveta.</p>
          <Formulario acao={abrirCaixa}>
            <label className="campo">
              Troco inicial (R$)
              <input name="trocoInicial" inputMode="decimal" placeholder="100,00" />
            </label>
            <button className="botao">Abrir o caixa</button>
          </Formulario>
        </>
      )}

      {aberto && vendas && (
        <>
          <p>
            Aberto em {quando(aberto.abertoEm)} com {brl(aberto.trocoInicial)} de troco.
          </p>
          <section>
            <h2>Entrou desde a abertura</h2>
            <ul className="lista">
              {[...vendas].map(([forma, valor]) => (
                <li key={forma}>
                  <div className="lista__nome">
                    <b>{rotuloPagamento(forma) || 'Sem forma informada'}</b>
                    <span>{brl(valor)}</span>
                  </div>
                </li>
              ))}
              {!vendas.size && <li className="vazio">Nenhuma venda ainda.</li>}
            </ul>
            <p>
              Entrega em dinheiro não entra aqui: o dinheiro vem pelo acerto do entregador. Só o dinheiro conta na gaveta; Pix e cartão aparecem para você conferir.
            </p>
          </section>

          <section>
            <h2>Sangrias e suprimentos</h2>
            {!(aberto.movimentos ?? []).length && <p className="vazio">Nada lançado.</p>}
            <ul className="lista">
              {(aberto.movimentos ?? []).map((m) => (
                <li key={m.id}>
                  <div className="lista__nome">
                    <b>
                      {m.tipo === 'sangria' ? '−' : '+'} {brl(m.valor)}
                    </b>
                    <span>
                      {m.tipo === 'sangria' ? 'Sangria' : 'Suprimento'} · {m.motivo} · {quando(m.em)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <Formulario acao={movimentarCaixa} className="form linha">
              <select name="tipo" aria-label="Tipo de lançamento" defaultValue="sangria">
                {MOVIMENTOS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <input name="valor" inputMode="decimal" required aria-label="Valor" placeholder="50,00" />
              <input name="motivo" required maxLength={120} aria-label="Motivo" placeholder="Motivo" />
              <button className="botao secundario">Lançar</button>
            </Formulario>
          </section>

          <section>
            <h2>Fechar o caixa</h2>
            <p>
              Deveria ter <b>{brl(esperado)}</b> em dinheiro na gaveta. Conte o dinheiro e digite abaixo.
            </p>
            <Formulario acao={fecharCaixa}>
              <label className="campo">
                Dinheiro contado (R$)
                <input name="contado" inputMode="decimal" required placeholder="350,00" />
              </label>
              <label className="campo">
                Observação (opcional)
                <input name="observacao" maxLength={300} />
              </label>
              <button className="botao">Fechar o caixa</button>
            </Formulario>
          </section>
        </>
      )}

      {fechados.length > 0 && (
        <section>
          <h2>Últimos fechamentos</h2>
          <ul className="lista">
            {fechados.map((c) => (
              <li key={c.id}>
                <div className="lista__nome">
                  <b>
                    {quando(c.abertoEm)} a {quando(c.fechadoEm!)}
                  </b>
                  <span>
                    Esperado {brl(c.esperado ?? 0)} · contado {brl(c.contado ?? 0)} · {rotuloDiferenca(c.diferenca ?? 0)}
                    {c.diferenca ? ` ${brl(Math.abs(c.diferenca))}` : ''}
                    {c.observacao ? ` · ${c.observacao}` : ''}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
