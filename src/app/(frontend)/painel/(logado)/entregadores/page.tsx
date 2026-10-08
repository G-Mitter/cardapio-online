import type { Metadata } from 'next'

import { AcertoEntregador } from '@/components/painel/AcertoEntregador'
import { Formulario } from '@/components/painel/Formulario'
import { diferencaDoAcerto, intervaloDoDia, resumoPorEntregador, rotuloResumo } from '@/lib/entregadores'
import { sessao } from '@/lib/painel'
import { brl, FORMAS_PAGAMENTO, rotuloPagamento } from '@/lib/pedido'

import { ligarEntregador, mudarPagamentoDoPedido, salvarEntregador } from '../../actions'

export const metadata: Metadata = { title: 'Entregadores' }

/** Entregadores da loja e o relatório do dia: quantas entregas e quanto de taxa cada um fez. */
export default async function Entregadores({ searchParams }: { searchParams: Promise<{ dia?: string }> }) {
  const { payload, loja, comoUsuario } = await sessao()
  const { dia, de, ate } = intervaloDoDia((await searchParams).dia)
  const [entregadores, entregues, acertos] = await Promise.all([
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
    payload.find({
      collection: 'acertos',
      where: { loja: { equals: loja.id }, dia: { equals: dia } },
      sort: 'createdAt',
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

  // Acerto do dia: por entregador, o que já foi conferido e o que ainda falta.
  const jaAcertados = new Set(acertos.docs.flatMap((a) => (a.pedidos ?? []).map((p) => (typeof p === 'number' ? p : p.id))))
  const formas = FORMAS_PAGAMENTO.filter((f) => loja.formasPagamento?.includes(f.value))
  const doAcerto = [...new Set(entregues.docs.flatMap((p) => (typeof p.entregador === 'number' ? [p.entregador] : [])))]
    .map((id) => ({
      id,
      nome: nomes.get(id) ?? 'Removido',
      feitos: acertos.docs.filter((a) => (typeof a.entregador === 'number' ? a.entregador : a.entregador.id) === id),
      pendentes: entregues.docs.filter((p) => p.entregador === id && !jaAcertados.has(p.id)),
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

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

      <h2>Acerto do dia</h2>
      {!doAcerto.length && <p className="vazio">Nenhuma entrega concluída neste dia para acertar.</p>}
      {doAcerto.map((e) => (
        <section key={e.id}>
          <h3>{e.nome}</h3>
          {e.feitos.map((a) => (
            <p key={a.id}>
              ✓ Acerto feito às{' '}
              {new Date(a.createdAt).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })}:
              entregou {brl(a.entregue)} de {brl(a.esperado)} · {diferencaDoAcerto(a.entregue, a.esperado).rotulo}
            </p>
          ))}
          {e.pendentes.length > 0 && (
            <>
              <ul className="lista">
                {e.pendentes.map((p) => (
                  <li key={p.id}>
                    <div className="lista__nome">
                      <b>Pedido nº {p.numero}</b>
                      <span>
                        {brl(p.total)} · {rotuloPagamento(p.pagamento) || 'Sem forma de pagamento'}
                      </span>
                    </div>
                    <form action={mudarPagamentoDoPedido.bind(null, p.id)} className="linha">
                      <select name="forma" defaultValue={p.pagamento ?? ''} aria-label={`Pagamento do pedido ${p.numero}`}>
                        {formas.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                      <button className="botao secundario">Trocar</button>
                    </form>
                  </li>
                ))}
              </ul>
              <small>Se o cliente pagou diferente do pedido, troque a forma de pagamento antes do acerto.</small>
              <AcertoEntregador
                entregador={e.id}
                dia={dia}
                entregas={e.pendentes.map((p) => ({ total: p.total, taxa: p.taxa, pagamento: p.pagamento }))}
              />
            </>
          )}
        </section>
      ))}
    </>
  )
}
