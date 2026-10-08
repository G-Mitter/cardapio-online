import type { Metadata } from 'next'
import Link from 'next/link'

import { Formulario } from '@/components/painel/Formulario'
import { hojeEmBrasilia } from '@/lib/entregadores'
import { alertas, CATEGORIAS, intervaloDoMes, resumoDoMes, situacao, TIPOS } from '@/lib/financeiro'
import { sessao } from '@/lib/painel'
import { brl, rotuloPagamento } from '@/lib/pedido'

import { apagarLancamento, baixarLancamento, salvarLancamento } from '../../actions'

export const metadata: Metadata = { title: 'Financeiro' }

const dataBr = (d: string) => d.split('-').reverse().join('/')
const ROTULO_SITUACAO = { vencida: 'Vencida', hoje: 'Vence hoje', em7: 'Vence em até 7 dias', futura: '' } as const

/** Contas a pagar e a receber, com o aviso do que vence e o resumo do mês. */
export default async function Financeiro({ searchParams }: { searchParams: Promise<{ aba?: string; mes?: string }> }) {
  const { aba: abaTexto, mes: mesTexto } = await searchParams
  const { payload, loja, comoUsuario } = await sessao()
  const aba = TIPOS.find((t) => t.value === abaTexto) ?? TIPOS[0]
  const { mes, de, ate } = intervaloDoMes(mesTexto)
  const hoje = hojeEmBrasilia()
  const busca = { limit: 0, depth: 0, ...comoUsuario } as const

  const [abertas, doMes, pedidos, fechamentos] = await Promise.all([
    payload.find({
      collection: 'lancamentos',
      where: { loja: { equals: loja.id }, pagoEm: { exists: false } },
      sort: 'vencimento',
      ...busca,
    }),
    // pagoEm é texto AAAA-MM-DD: "like" com o mês pega só os do mês.
    payload.find({
      collection: 'lancamentos',
      where: { loja: { equals: loja.id }, pagoEm: { like: mes } },
      sort: 'pagoEm',
      ...busca,
    }),
    payload.find({
      collection: 'pedidos',
      where: {
        loja: { equals: loja.id },
        status: { equals: 'entregue' },
        mesa: { exists: false },
        createdAt: { greater_than_equal: de, less_than: ate },
      },
      ...busca,
    }),
    payload.find({
      collection: 'fechamentos',
      where: { loja: { equals: loja.id }, createdAt: { greater_than_equal: de, less_than: ate } },
      ...busca,
    }),
  ])

  const soma = (tipo: string) =>
    doMes.docs.filter((l) => l.tipo === tipo).reduce((s, l) => s + Math.round((l.valorPago ?? l.valor) * 100), 0) / 100
  const resumo = resumoDoMes(
    [
      ...pedidos.docs.map((p) => ({ forma: p.pagamento ?? 'sem', valor: p.total })),
      ...fechamentos.docs.flatMap((f) => (f.pagamentos ?? []).map((p) => ({ forma: p.forma, valor: p.valor }))),
    ],
    fechamentos.docs.reduce((s, f) => s + Math.round((f.taxaServico ?? 0) * 100), 0) / 100,
    soma('receber'),
    soma('pagar'),
  )
  const doTipo = (tipo: string) => abertas.docs.filter((l) => l.tipo === tipo)

  return (
    <>
      <h1>Financeiro</h1>

      <section>
        {TIPOS.map((t) => {
          const a = alertas(doTipo(t.value), hoje)
          return (
            <p key={t.value}>
              <b>{t.label}:</b> {a.vencidas.n} {a.vencidas.n === 1 ? 'vencida' : 'vencidas'} ({brl(a.vencidas.total)}) ·{' '}
              {a.hoje.n} {a.hoje.n === 1 ? 'vence' : 'vencem'} hoje ({brl(a.hoje.total)}) · {a.em7.n} nos próximos 7 dias (
              {brl(a.em7.total)})
            </p>
          )
        })}
      </section>

      <div className="linha">
        {TIPOS.map((t) => (
          <Link
            key={t.value}
            href={`/painel/financeiro?aba=${t.value}`}
            className={`botao ${t.value === aba.value ? '' : 'secundario'}`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {!doTipo(aba.value).length && <p className="vazio">Nenhuma conta {aba.label.toLowerCase()} em aberto.</p>}
      <ul className="lista">
        {doTipo(aba.value).map((l) => {
          const s = situacao(l.vencimento, hoje)
          return (
            <li key={l.id}>
              <div className="lista__nome">
                <b>{l.descricao}</b>
                <span>
                  {brl(l.valor)} · vence {dataBr(l.vencimento)}
                  {s !== 'futura' && ` · ${ROTULO_SITUACAO[s]}`}
                  {l.categoria && ` · ${l.categoria}`}
                  {l.repetir && ' · repete todo mês'}
                </span>
                {l.observacao && <small>{l.observacao}</small>}
                <details>
                  <summary>{aba.baixa}</summary>
                  <form action={baixarLancamento.bind(null, l.id)} className="linha">
                    <label className="campo curto">
                      Data
                      <input name="pagoEm" type="date" defaultValue={hoje} required />
                    </label>
                    <label className="campo curto">
                      Valor (R$)
                      <input name="valorPago" inputMode="decimal" defaultValue={String(l.valor).replace('.', ',')} />
                    </label>
                    <button className="botao">{aba.baixa}</button>
                  </form>
                  <small>O valor pode ser diferente do original (juros ou desconto).</small>
                </details>
              </div>
              <form action={apagarLancamento.bind(null, l.id)}>
                <button className="botao secundario">Apagar</button>
              </form>
            </li>
          )
        })}
      </ul>

      <h2>Nova conta</h2>
      <Formulario key={abertas.totalDocs} acao={salvarLancamento}>
        <div className="linha">
          <label className="campo curto">
            Tipo
            <select name="tipo" defaultValue={aba.value}>
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="campo">
            Descrição
            <input name="descricao" required maxLength={120} placeholder="Aluguel de outubro" />
          </label>
        </div>
        <div className="linha">
          <label className="campo curto">
            Valor (R$)
            <input name="valor" inputMode="decimal" required placeholder="1500,00" />
          </label>
          <label className="campo curto">
            Vencimento
            <input name="vencimento" type="date" defaultValue={hoje} required />
          </label>
          <label className="campo">
            Categoria
            <select name="categoria" defaultValue="Outros">
              {CATEGORIAS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="campo">
          Observação (opcional)
          <input name="observacao" maxLength={300} />
        </label>
        <label className="marcar">
          <input type="checkbox" name="repetir" />
          Repetir todo mês (aluguel, internet...). Ao dar baixa, a do mês seguinte aparece sozinha.
        </label>
        <button className="botao">Salvar conta</button>
      </Formulario>

      <h2>Resumo do mês</h2>
      <form className="linha" method="get">
        <input type="hidden" name="aba" value={aba.value} />
        <label className="campo curto">
          Mês
          <input name="mes" type="month" defaultValue={mes} />
        </label>
        <button className="botao secundario">Ver</button>
      </form>
      <ul className="lista">
        {resumo.porForma.map((f) => (
          <li key={f.forma}>
            <div className="lista__nome">
              <b>Vendas em {rotuloPagamento(f.forma) || 'forma não informada'}</b>
              <span>{brl(f.valor)}</span>
            </div>
          </li>
        ))}
        {resumo.taxaServico > 0 && (
          <li>
            <div className="lista__nome">
              <b>Taxa de serviço das mesas (não é venda)</b>
              <span>− {brl(resumo.taxaServico)}</span>
            </div>
          </li>
        )}
      </ul>
      <p>
        Vendas: <b>{brl(resumo.vendas)}</b> + recebido: <b>{brl(resumo.recebido)}</b> − pago: <b>{brl(resumo.pago)}</b>
      </p>
      <p>
        <b>Saldo do mês: {brl(resumo.saldo)}</b>
      </p>
      <p>
        <small>
          Vendas são os pedidos entregues e as contas de mesa fechadas no mês. É um controle simples da loja e não
          substitui a contabilidade. Se uma venda a prazo também entrou como conta a receber, ela conta duas vezes: dê
          baixa só no que ainda não está nas vendas.
        </small>
      </p>
    </>
  )
}
