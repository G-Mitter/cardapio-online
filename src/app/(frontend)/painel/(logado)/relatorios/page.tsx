import type { Metadata } from 'next'

import { brl, rotuloPagamento } from '@/lib/pedido'
import { sessao } from '@/lib/painel'
import { MAX_DIAS, periodo, resumirVendas, somarPorForma } from '@/lib/relatorios'

export const metadata: Metadata = { title: 'Relatórios de vendas' }

const dataBr = (dia: string) => dia.split('-').reverse().join('/')

/** Vendas de um período: total, ticket médio, por dia, por forma de pagamento e os mais vendidos. */
export default async function Relatorios({ searchParams }: { searchParams: Promise<{ de?: string; ate?: string }> }) {
  const { de: deTexto, ate: ateTexto } = await searchParams
  const { payload, loja, comoUsuario } = await sessao('financeiro')
  const p = periodo(deTexto, ateTexto)
  const busca = { limit: 0, depth: 0, ...comoUsuario } as const
  const intervalo = { greater_than_equal: p.desdeISO, less_than: p.ateISO }

  // Vendas: pedidos entregues sem mesa e pedidos de mesa com a conta fechada (nenhum cancelado).
  const [pedidos, fechamentos] = await Promise.all([
    payload.find({
      collection: 'pedidos',
      where: {
        loja: { equals: loja.id },
        status: { not_equals: 'cancelado' },
        createdAt: intervalo,
        or: [{ and: [{ mesa: { exists: false } }, { status: { equals: 'entregue' } }] }, { and: [{ mesa: { exists: true } }, { contaFechada: { equals: true } }] }],
      },
      ...busca,
    }),
    payload.find({ collection: 'fechamentos', where: { loja: { equals: loja.id }, createdAt: intervalo }, ...busca }),
  ])

  const r = resumirVendas(pedidos.docs)
  const formas = somarPorForma([
    ...pedidos.docs.filter((x) => !x.mesa).map((x) => ({ forma: x.pagamento ?? 'sem', valor: x.total })),
    ...fechamentos.docs.flatMap((f) => (f.pagamentos ?? []).map((x) => ({ forma: x.forma, valor: x.valor }))),
  ])

  return (
    <>
      <h1>Relatórios de vendas</h1>
      <form className="linha" method="get">
        <label className="campo curto">
          De
          <input name="de" type="date" defaultValue={p.de} />
        </label>
        <label className="campo curto">
          Até
          <input name="ate" type="date" defaultValue={p.ate} />
        </label>
        <button className="botao secundario">Ver</button>
      </form>
      {p.cortado && <p role="status">O período máximo é de {MAX_DIAS} dias; mostrando os últimos {MAX_DIAS} até {dataBr(p.ate)}.</p>}

      {!r.pedidos ? (
        <p className="vazio">
          Nenhuma venda de {dataBr(p.de)} a {dataBr(p.ate)}.
        </p>
      ) : (
        <>
          <p>
            <b>{brl(r.total)}</b> em {r.pedidos} {r.pedidos === 1 ? 'pedido' : 'pedidos'} · ticket médio <b>{brl(r.ticketMedio)}</b>
          </p>

          <h2>Por dia</h2>
          <ul className="lista">
            {r.porDia.map((d) => (
              <li key={d.dia}>
                <div className="lista__nome">
                  <b>{dataBr(d.dia)}</b>
                  <span>
                    {d.pedidos} {d.pedidos === 1 ? 'pedido' : 'pedidos'} · {brl(d.total)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <h2>Por forma de pagamento</h2>
          <ul className="lista">
            {formas.map((f) => (
              <li key={f.forma}>
                <div className="lista__nome">
                  <b>{rotuloPagamento(f.forma) || 'Sem forma informada'}</b>
                  <span>{brl(f.valor)}</span>
                </div>
              </li>
            ))}
          </ul>
          <p>O recebido por forma inclui a taxa de serviço das mesas, que não entra no total de vendas acima.</p>

          <h2>Mais vendidos</h2>
          <ol className="lista">
            {r.produtos.slice(0, 20).map((x) => (
              <li key={x.nome}>
                <div className="lista__nome">
                  <b>{x.nome}</b>
                  <span>
                    {x.quantidade} {x.quantidade === 1 ? 'vendido' : 'vendidos'} · {brl(x.total)}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
    </>
  )
}
