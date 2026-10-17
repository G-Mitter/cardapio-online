import type { Metadata } from 'next'
import { cookies } from 'next/headers'

import { Formulario } from '@/components/painel/Formulario'
import { dinheiroEsperado, MOVIMENTOS, nomeDoCaixa, rotuloDiferenca } from '@/lib/caixa'
import { caixasAbertos, contarSemCaixa, vendasDoCaixa } from '@/lib/caixa-db'
import { brl, rotuloPagamento } from '@/lib/pedido'
import { COOKIE_CAIXA, sessao } from '@/lib/painel'

import { abrirCaixa, atribuirVendasSemCaixa, fecharCaixa, ligarCaixaCadastrado, movimentarCaixa, salvarCaixaCadastrado, trabalharNoCaixa } from '../../actions'

export const metadata: Metadata = { title: 'Caixa' }

const quando = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })

/** Caixas da loja: cada um abre com o seu troco, recebe suas vendas, tem sangria e suprimento e fecha separado. */
export default async function Caixa() {
  const { payload, loja, comoUsuario } = await sessao('financeiro')
  const [{ docs: cadastrados }, { docs: fechados }, abertos] = await Promise.all([
    payload.find({ collection: 'caixas-cadastrados', where: { loja: { equals: loja.id } }, sort: 'nome', limit: 0, depth: 0, ...comoUsuario }),
    payload.find({ collection: 'caixas', where: { loja: { equals: loja.id }, fechadoEm: { exists: true } }, sort: '-fechadoEm', limit: 10, depth: 1, ...comoUsuario }),
    caixasAbertos(payload, loja.id),
  ])
  const idAberto = (c: (typeof abertos)[number]) => (typeof c.cadastro === 'object' ? c.cadastro?.id : c.cadastro)
  const paraAbrir = cadastrados.filter((c) => c.ativo !== false && !abertos.some((a) => idAberto(a) === c.id))
  const doAparelho = Number((await cookies()).get(COOKIE_CAIXA)?.value)
  const semCaixa = abertos.length ? await contarSemCaixa(payload, loja.id, abertos[0].abertoEm) : 0
  const vendas = new Map(await Promise.all(abertos.map(async (c) => [c.id, await vendasDoCaixa(payload, loja.id, c.id)] as const)))

  return (
    <>
      <h1>Caixa</h1>

      {abertos.length === 0 && <p>Nenhum caixa aberto. Abra um caixa com o fundo de troco que está na gaveta.</p>}

      {semCaixa > 0 && (
        <section>
          <p className="aviso-dados" role="status">
            {semCaixa} {semCaixa === 1 ? 'venda está' : 'vendas estão'} sem caixa desde que o primeiro abriu. Elas não entram na conta de nenhum caixa.
          </p>
          <form action={atribuirVendasSemCaixa} className="form linha">
            <select name="caixa" aria-label="Caixa que recebeu" defaultValue={abertos.find((c) => c.id === doAparelho)?.id ?? abertos[0].id}>
              {abertos.map((c) => (
                <option key={c.id} value={c.id}>
                  {nomeDoCaixa(c.cadastro)}
                </option>
              ))}
            </select>
            <button className="botao secundario">Pôr neste caixa</button>
          </form>
        </section>
      )}

      {abertos.map((c) => {
        const v = vendas.get(c.id)!
        const esperado = dinheiroEsperado(c.trocoInicial, v.get('dinheiro') ?? 0, c.movimentos ?? [])
        const nome = nomeDoCaixa(c.cadastro)
        const doDelivery = typeof c.cadastro === 'object' && c.cadastro?.delivery
        return (
          <article key={c.id} className="caixa-aberto" aria-label={`Caixa ${nome}`}>
            <h2>
              {nome}
              {doDelivery && <small> · delivery</small>}
              {c.id === doAparelho && <span className="selo">Você está neste</span>}
            </h2>
            <p>
              Aberto em {quando(c.abertoEm)} com {brl(c.trocoInicial)} de troco.
            </p>
            {c.id !== doAparelho && abertos.length > 1 && (
              <form action={trabalharNoCaixa}>
                <input type="hidden" name="caixa" value={c.id} />
                <button className="botao secundario">Trabalhar neste caixa</button>
              </form>
            )}
            <section>
              <h3>Entrou desde a abertura</h3>
              <ul className="lista">
                {[...v].map(([forma, valor]) => (
                  <li key={forma}>
                    <div className="lista__nome">
                      <b>{rotuloPagamento(forma) || 'Sem forma informada'}</b>
                      <span>{brl(valor)}</span>
                    </div>
                  </li>
                ))}
                {!v.size && <li className="vazio">Nenhuma venda ainda.</li>}
              </ul>
              <p>
                Entrega em dinheiro entra no caixa do delivery, pelo acerto do entregador. Só o dinheiro conta na gaveta; Pix e cartão aparecem para você conferir.
              </p>
            </section>

            <section>
              <h3>Sangrias e suprimentos</h3>
              {!(c.movimentos ?? []).length && <p className="vazio">Nada lançado.</p>}
              <ul className="lista">
                {(c.movimentos ?? []).map((m) => (
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
                <input type="hidden" name="caixa" value={c.id} />
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
              <h3>Fechar o caixa {nome}</h3>
              <p>
                Deveria ter <b>{brl(esperado)}</b> em dinheiro na gaveta. Conte o dinheiro e digite abaixo.
              </p>
              <Formulario acao={fecharCaixa}>
                <input type="hidden" name="caixa" value={c.id} />
                <label className="campo">
                  Dinheiro contado (R$)
                  <input name="contado" inputMode="decimal" required placeholder="350,00" />
                </label>
                <label className="campo">
                  Observação (opcional)
                  <input name="observacao" maxLength={300} />
                </label>
                <button className="botao">Fechar o caixa {nome}</button>
              </Formulario>
            </section>
          </article>
        )
      })}

      <section>
        <h2>Abrir um caixa</h2>
        {paraAbrir.length ? (
          <Formulario acao={abrirCaixa}>
            <label className="campo">
              Caixa
              <select name="cadastro" required>
                {paraAbrir.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                    {c.delivery ? ' (delivery)' : ''}
                  </option>
                ))}
              </select>
            </label>
            <label className="campo">
              Fundo de troco (R$)
              <input name="trocoInicial" inputMode="decimal" placeholder="100,00" />
            </label>
            <button className="botao">Abrir o caixa</button>
          </Formulario>
        ) : (
          <p className="vazio">{cadastrados.some((c) => c.ativo !== false) ? 'Todos os caixas cadastrados já estão abertos.' : 'Cadastre um caixa abaixo para poder abrir.'}</p>
        )}
      </section>

      <section>
        <h2>Caixas cadastrados</h2>
        <ul className="lista">
          {cadastrados.map((c) => (
            <li key={c.id} className={c.ativo === false ? 'esgotado' : undefined}>
              <div className="lista__nome">
                <b>{c.nome}</b>
                <span>
                  {c.delivery && 'Delivery'}
                  {c.delivery && c.ativo === false && ' · '}
                  {c.ativo === false && 'Desligado'}
                </span>
              </div>
              <form action={ligarCaixaCadastrado.bind(null, c.id, c.ativo === false)}>
                <button className="botao secundario">{c.ativo === false ? 'Ligar' : 'Desligar'}</button>
              </form>
            </li>
          ))}
          {!cadastrados.length && <li className="vazio">Nenhum caixa cadastrado.</li>}
        </ul>
        <Formulario key={cadastrados.length} acao={salvarCaixaCadastrado} className="form linha">
          <input name="nome" required maxLength={30} aria-label="Nome ou número do caixa" placeholder="Ex.: 101" />
          <label className="marcar">
            <input type="checkbox" name="delivery" />
            Caixa do delivery
          </label>
          <button className="botao secundario">Cadastrar caixa</button>
        </Formulario>
      </section>

      {fechados.length > 0 && (
        <section>
          <h2>Últimos fechamentos</h2>
          <ul className="lista">
            {fechados.map((c) => (
              <li key={c.id}>
                <div className="lista__nome">
                  <b>
                    {nomeDoCaixa(c.cadastro)} · {quando(c.abertoEm)} a {quando(c.fechadoEm!)}
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
