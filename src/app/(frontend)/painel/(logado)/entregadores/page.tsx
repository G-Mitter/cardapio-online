import type { Metadata } from 'next'

import { Formulario } from '@/components/painel/Formulario'
import { intervaloDoDia, resumoPorEntregador, rotuloResumo } from '@/lib/entregadores'
import { sessao } from '@/lib/painel'

import { ligarEntregador, salvarEntregador } from '../../actions'

export const metadata: Metadata = { title: 'Entregadores' }

/** Entregadores da loja e o relatório do dia: quantas entregas e quanto de taxa cada um fez. */
export default async function Entregadores({ searchParams }: { searchParams: Promise<{ dia?: string }> }) {
  const { payload, loja, comoUsuario } = await sessao()
  const { dia, de, ate } = intervaloDoDia((await searchParams).dia)
  const [entregadores, entregues] = await Promise.all([
    payload.find({
      collection: 'entregadores',
      where: { loja: { equals: loja.id } },
      sort: 'nome',
      limit: 0,
      depth: 0,
      ...comoUsuario,
    }),
    payload.find({
      collection: 'pedidos',
      where: {
        loja: { equals: loja.id },
        modo: { equals: 'entrega' },
        status: { equals: 'entregue' },
        entregador: { exists: true },
        createdAt: { greater_than_equal: de, less_than: ate },
      },
      limit: 0,
      depth: 0,
      ...comoUsuario,
    }),
  ])

  const nomes = new Map(entregadores.docs.map((e) => [e.id, e.nome]))
  const resumo = resumoPorEntregador(
    entregues.docs.flatMap((p) =>
      typeof p.entregador === 'number' ? [{ entregador: nomes.get(p.entregador) ?? 'Removido', taxa: p.taxa }] : [],
    ),
  )

  return (
    <>
      <h1>Entregadores</h1>
      {!entregadores.docs.length && <p className="vazio">Nenhum entregador ainda.</p>}
      <ul className="lista">
        {entregadores.docs.map((e) => (
          <li key={e.id} className={e.ativo === false ? 'esgotado' : undefined}>
            <div className="lista__nome">
              <b>{e.nome}</b>
              <span>
                {e.whatsapp}
                {e.ativo === false && ' · Desligado'}
              </span>
            </div>
            <form action={ligarEntregador.bind(null, e.id, e.ativo === false)}>
              <button className="botao secundario">{e.ativo === false ? 'Ligar' : 'Desligar'}</button>
            </form>
          </li>
        ))}
      </ul>

      <h2>Novo entregador</h2>
      <Formulario key={entregadores.docs.length} acao={salvarEntregador}>
        <div className="linha">
          <label className="campo">
            Nome
            <input name="nome" required maxLength={80} />
          </label>
          <label className="campo">
            WhatsApp
            <input name="whatsapp" type="tel" required placeholder="(31) 99999-0000" />
          </label>
        </div>
        <button className="botao">Cadastrar</button>
      </Formulario>

      <h2>Entregas do dia</h2>
      <form className="linha" method="get">
        <label className="campo curto">
          Dia
          <input name="dia" type="date" defaultValue={dia} />
        </label>
        <button className="botao secundario">Ver</button>
      </form>
      {!resumo.length ? (
        <p className="vazio">Nenhuma entrega concluída neste dia.</p>
      ) : (
        <ul className="lista">
          {resumo.map((r) => (
            <li key={r.entregador}>
              <div className="lista__nome">
                <b>{r.entregador}</b>
                <span>{rotuloResumo(r)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p>
        <small>Conta só as entregas marcadas como Entregue, pelo dia em que o pedido foi feito.</small>
      </p>
    </>
  )
}
