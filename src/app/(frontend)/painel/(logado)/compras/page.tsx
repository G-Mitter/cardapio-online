import type { Metadata } from 'next'
import Link from 'next/link'

import { Apagavel, BotaoApagar } from '@/components/painel/Apagar'
import { Formulario } from '@/components/painel/Formulario'
import { ListaCompra } from '@/components/painel/ListaCompra'
import { hojeEmBrasilia } from '@/lib/entregadores'
import { rotuloQuantidade } from '@/lib/estoque'
import { sessao } from '@/lib/painel'
import { brl } from '@/lib/pedido'

import { apagarFornecedor, registrarCompra, salvarFornecedor } from '../../actions'

export const metadata: Metadata = { title: 'Compras' }

const dataBr = (dia: string) => dia.split('-').reverse().join('/')

/** Compras de ingredientes: o que entrou, de quem e quanto custou, e os fornecedores. */
export default async function Compras() {
  const { payload, loja, comoUsuario } = await sessao('financeiro')
  const busca = { limit: 0, depth: 0, ...comoUsuario } as const
  const [fornecedores, ingredientes, compras] = await Promise.all([
    payload.find({ collection: 'fornecedores', where: { loja: { equals: loja.id } }, sort: 'nome', ...busca }),
    payload.find({ collection: 'ingredientes', where: { loja: { equals: loja.id } }, sort: 'nome', ...busca }),
    payload.find({ collection: 'compras', where: { loja: { equals: loja.id } }, sort: ['-data', '-id'], limit: 15, depth: 0, ...comoUsuario }),
  ])
  const nomeDoFornecedor = new Map(fornecedores.docs.map((f) => [f.id, f.nome]))
  const ingrediente = new Map(ingredientes.docs.map((i) => [i.id, i]))
  const idDe = (v: number | { id: number }) => (typeof v === 'object' ? v.id : v)
  const hoje = hojeEmBrasilia()

  return (
    <>
      <h1>Compras</h1>

      <h2>Nova compra</h2>
      {!fornecedores.docs.length || !ingredientes.docs.length ? (
        <p className="vazio">
          Para registrar uma compra, cadastre {!fornecedores.docs.length && 'um fornecedor aqui embaixo'}
          {!fornecedores.docs.length && !ingredientes.docs.length && ' e '}
          {!ingredientes.docs.length && (
            <>
              ingredientes em <Link href="/painel/estoque">Estoque</Link>
            </>
          )}
          .
        </p>
      ) : (
        <Formulario acao={registrarCompra} key={compras.totalDocs}>
          <div className="linha">
            <label className="campo">
              Fornecedor
              <select name="fornecedor" required defaultValue="">
                <option value="" disabled>
                  Escolha…
                </option>
                {fornecedores.docs.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="campo curto">
              Data da compra
              <input name="data" type="date" defaultValue={hoje} />
            </label>
          </div>
          <ListaCompra ingredientes={ingredientes.docs.map((i) => ({ id: i.id, nome: i.nome, unidade: i.unidade }))} />
          <div className="linha">
            <label className="campo curto">
              Vencimento (se for a prazo)
              <input name="vencimento" type="date" defaultValue={hoje} />
            </label>
            <label className="marcar">
              <input type="checkbox" name="aVista" />
              Paguei na hora
            </label>
          </div>
          <label className="campo">
            Observação (opcional)
            <input name="observacao" maxLength={300} />
          </label>
          <button className="botao">Registrar compra</button>
          <small>Soma no estoque, atualiza o custo dos ingredientes e cria a conta a pagar no Financeiro (já paga, se pagou na hora).</small>
        </Formulario>
      )}

      <h2>Últimas compras</h2>
      {!compras.docs.length && <p className="vazio">Nenhuma compra registrada ainda.</p>}
      <ul className="lista">
        {compras.docs.map((c) => (
          <li key={c.id}>
            <div className="lista__nome">
              <b>
                {dataBr(c.data)} · {nomeDoFornecedor.get(idDe(c.fornecedor)) ?? 'Fornecedor'} · {brl(c.total)}
              </b>
              <span>
                {c.itens.map((i) => `${rotuloQuantidade(i.quantidade, ingrediente.get(idDe(i.ingrediente))?.unidade ?? '')} ${ingrediente.get(idDe(i.ingrediente))?.nome ?? 'ingrediente'}`).join(', ')}
                {c.aVista ? ' · pago na hora' : c.vencimento ? ` · vence ${dataBr(c.vencimento)}` : ''}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <p>
        Errou uma compra? Corrija a quantidade em <Link href="/painel/estoque">Estoque</Link> e apague a conta em <Link href="/painel/financeiro">Financeiro</Link>.
      </p>

      <h2>Fornecedores</h2>
      {!fornecedores.docs.length && <p className="vazio">Nenhum fornecedor ainda.</p>}
      <ul className="lista">
        {fornecedores.docs.map((f) => (
          <Apagavel key={f.id} chave={`fornecedor:${f.id}`}>
            <div className="lista__nome">
              <b>{f.nome}</b>
              <span>{f.telefone || 'Sem telefone'}</span>
            </div>
            <details>
              <summary>Editar</summary>
              <Formulario acao={salvarFornecedor.bind(null, f.id)}>
                <label className="campo">
                  Nome
                  <input name="nome" required maxLength={80} defaultValue={f.nome} />
                </label>
                <label className="campo">
                  Telefone
                  <input name="telefone" inputMode="tel" maxLength={30} defaultValue={f.telefone ?? ''} />
                </label>
                <label className="campo">
                  Observação
                  <input name="observacao" maxLength={300} defaultValue={f.observacao ?? ''} />
                </label>
                <button className="botao">Salvar</button>
              </Formulario>
            </details>
            <BotaoApagar chave={`fornecedor:${f.id}`} nome={f.nome} acao={apagarFornecedor.bind(null, f.id)} />
          </Apagavel>
        ))}
      </ul>

      <h3>Novo fornecedor</h3>
      <Formulario acao={salvarFornecedor.bind(null, null)} key={fornecedores.totalDocs}>
        <label className="campo">
          Nome
          <input name="nome" required maxLength={80} placeholder="Distribuidora Silva" />
        </label>
        <label className="campo">
          Telefone (opcional)
          <input name="telefone" inputMode="tel" maxLength={30} />
        </label>
        <label className="campo">
          Observação (opcional)
          <input name="observacao" maxLength={300} />
        </label>
        <button className="botao">Cadastrar</button>
      </Formulario>
    </>
  )
}
