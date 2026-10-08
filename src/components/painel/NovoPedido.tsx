'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import type { Bairro } from '@/lib/entrega'
import { type Escolhas, type GrupoOpcao, resolverEscolhas } from '@/lib/opcoes'
import { brl, type FormaPagamento } from '@/lib/pedido'

import { criarPedidoDaMesa, criarPedidoPainel, type DadosPedidoPainel } from '@/app/(frontend)/painel/actions'

type Produto = { id: number; nome: string; preco: number; opcoes: GrupoOpcao[] }
type Linha = { chave: string; produto: Produto; escolhas: Escolhas; descricao: string; preco: number; quantidade: number }

const chaveDe = (id: number, escolhas: Escolhas) =>
  `${id}:${JSON.stringify(Object.entries(escolhas).filter(([, v]) => v.length).sort())}`

/** Lançar pedido de balcão ou de telefone: o total aqui é só para mostrar, o servidor refaz a conta. */
export function NovoPedido({
  produtos,
  fazEntrega,
  aceitaRetirada,
  bairros,
  taxaEntrega,
  pagamentos,
  mesa,
}: {
  produtos: Produto[]
  fazEntrega: boolean
  aceitaRetirada: boolean
  bairros: Bairro[]
  taxaEntrega: number
  pagamentos: { value: FormaPagamento; label: string }[]
  /** Lançando para uma mesa: sem tipo, cliente, endereço nem pagamento (paga no caixa). */
  mesa?: string
}) {
  const router = useRouter()
  const [enviando, startTransition] = useTransition()
  const [linhas, setLinhas] = useState<Linha[]>([])
  const [tipo, setTipo] = useState<DadosPedidoPainel['tipo']>('balcao')
  const [bairro, setBairro] = useState('')
  const [pagamento, setPagamento] = useState<FormaPagamento | ''>(pagamentos[0]?.value ?? '')
  const [configurando, setConfigurando] = useState<Produto | null>(null)
  const [selecao, setSelecao] = useState<Escolhas>({})
  const [erro, setErro] = useState('')

  const mudar = (produto: Produto, escolhas: Escolhas, delta: number) =>
    setLinhas((ls) => {
      const chave = chaveDe(produto.id, escolhas)
      const atual = ls.find((l) => l.chave === chave)
      const q = (atual?.quantidade ?? 0) + delta
      if (q <= 0) return ls.filter((l) => l.chave !== chave)
      if (atual) return ls.map((l) => (l.chave === chave ? { ...l, quantidade: q } : l))
      const o = resolverEscolhas(produto.opcoes, escolhas)
      return [
        ...ls,
        {
          chave,
          produto,
          escolhas,
          descricao: o.ok ? o.descricao : '',
          preco: produto.preco + (o.ok ? o.adicional : 0),
          quantidade: q,
        },
      ]
    })

  function marcar(g: GrupoOpcao, itemId: string, marcado: boolean) {
    setSelecao((s) => {
      const atual = s[g.id] ?? []
      if (g.max === 1) return { ...s, [g.id]: [itemId] }
      return { ...s, [g.id]: marcado ? [...atual, itemId] : atual.filter((id) => id !== itemId) }
    })
  }

  const confirmacao = configurando && resolverEscolhas(configurando.opcoes, selecao)
  const entrega = tipo === 'entrega'
  const taxa = !entrega ? 0 : bairros.length ? (bairros.find((b) => b.nome === bairro)?.taxa ?? 0) : taxaEntrega
  const subtotal = linhas.reduce((s, l) => s + l.preco * l.quantidade, 0)

  function enviar(form: FormData) {
    const campo = (nome: string) => String(form.get(nome) ?? '')
    setErro('')
    startTransition(async () => {
      const itens = linhas.map((l) => ({ produto: l.produto.id, quantidade: l.quantidade, escolhas: l.escolhas }))
      if (mesa) {
        const r = await criarPedidoDaMesa(mesa, itens, campo('observacoes'))
        if (r.ok) router.push('/painel/garcom')
        else setErro(r.erro)
        return
      }
      const r = await criarPedidoPainel({
        tipo,
        itens,
        nome: campo('nome'),
        telefone: campo('telefone'),
        endereco: campo('endereco'),
        bairro,
        pagamento: pagamento as FormaPagamento,
        trocoPara: campo('trocoPara'),
        observacoes: campo('observacoes'),
      })
      if (r.ok) router.push('/painel')
      else setErro(r.erro)
    })
  }

  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault()
        enviar(new FormData(e.currentTarget))
      }}
    >
      <fieldset disabled={enviando}>
        <h2>Produtos</h2>
        <ul className="lista">
          {produtos.map((p) => (
            <li key={p.id}>
              <span className="lista__nome">
                {p.nome} <span>{brl(p.preco)}</span>
              </span>
              <button
                type="button"
                className="botao secundario"
                onClick={() => {
                  if (!p.opcoes.length) return mudar(p, {}, 1)
                  setConfigurando(p)
                  setSelecao({})
                }}
              >
                Adicionar
              </button>
            </li>
          ))}
        </ul>

        {configurando && (
          <section className="grupo">
            <h2>{configurando.nome}</h2>
            {configurando.opcoes.map((g) => (
              <fieldset key={g.id}>
                <legend>
                  {g.nome} · {g.min > 0 ? 'obrigatório' : 'opcional'}
                  {g.max > 1 ? `, até ${g.max}` : ''}
                </legend>
                {g.itens.map((i) => {
                  const marcados = selecao[g.id] ?? []
                  const marcado = marcados.includes(i.id)
                  return (
                    <label key={i.id} className="marcar">
                      <input
                        type={g.max === 1 ? 'radio' : 'checkbox'}
                        name={g.id}
                        checked={marcado}
                        disabled={g.max > 1 && !marcado && marcados.length >= g.max}
                        onChange={(e) => marcar(g, i.id, e.target.checked)}
                      />
                      {i.nome}
                      {i.preco > 0 && ` (+ ${brl(i.preco)})`}
                    </label>
                  )
                })}
              </fieldset>
            ))}
            {confirmacao && !confirmacao.ok && <p className="erro">{confirmacao.erro}</p>}
            <div className="pedido__acoes">
              <button
                type="button"
                className="botao"
                disabled={!confirmacao?.ok}
                onClick={() => {
                  mudar(configurando, selecao, 1)
                  setConfigurando(null)
                }}
              >
                Adicionar ao pedido
              </button>
              <button type="button" className="botao secundario" onClick={() => setConfigurando(null)}>
                Cancelar
              </button>
            </div>
          </section>
        )}

        <h2>Pedido</h2>
        {linhas.length === 0 ? (
          <p className="vazio">Nenhum item ainda.</p>
        ) : (
          <ul className="lista">
            {linhas.map((l) => (
              <li key={l.chave}>
                <span className="lista__nome">
                  {l.quantidade}× {l.produto.nome}
                  {l.descricao && <span> ({l.descricao})</span>}
                </span>
                <span>{brl(l.preco * l.quantidade)}</span>
                <button type="button" className="botao secundario" onClick={() => mudar(l.produto, l.escolhas, -1)}>
                  −
                </button>
                <button type="button" className="botao secundario" onClick={() => mudar(l.produto, l.escolhas, 1)}>
                  +
                </button>
              </li>
            ))}
          </ul>
        )}

        {!mesa && (
          <>
        <div className="campo">
          <label htmlFor="tipo">Tipo do pedido</label>
          <select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value as typeof tipo)}>
            <option value="balcao">Balcão (retira na hora)</option>
            {aceitaRetirada && <option value="retirada">Retirada</option>}
            {fazEntrega && <option value="entrega">Entrega</option>}
          </select>
        </div>
        <div className="linha">
          <div className="campo">
            <label htmlFor="nome">Nome do cliente (opcional)</label>
            <input id="nome" name="nome" maxLength={100} autoComplete="off" />
          </div>
          <div className="campo">
            <label htmlFor="telefone">Telefone (opcional)</label>
            <input id="telefone" name="telefone" inputMode="tel" autoComplete="off" />
          </div>
        </div>
        {entrega && (
          <div className="linha">
            <div className="campo">
              <label htmlFor="endereco">Endereço da entrega</label>
              <input id="endereco" name="endereco" maxLength={200} required />
            </div>
            {bairros.length > 0 && (
              <div className="campo">
                <label htmlFor="bairro">Bairro</label>
                <select id="bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} required>
                  <option value="">Escolha</option>
                  {bairros.map((b) => (
                    <option key={b.nome} value={b.nome}>
                      {b.nome} ({brl(b.taxa)})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
        <div className="linha">
          <div className="campo">
            <label htmlFor="pagamento">Pagamento</label>
            <select id="pagamento" value={pagamento} onChange={(e) => setPagamento(e.target.value as FormaPagamento)} required>
              {pagamentos.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          {pagamento === 'dinheiro' && (
            <div className="campo">
              <label htmlFor="trocoPara">Troco para (R$, opcional)</label>
              <input id="trocoPara" name="trocoPara" inputMode="decimal" autoComplete="off" />
            </div>
          )}
        </div>
          </>
        )}
        <div className="campo">
          <label htmlFor="observacoes">Observações</label>
          <textarea id="observacoes" name="observacoes" maxLength={300} rows={2} />
        </div>

        <p>
          <b>
            Total: {brl(subtotal + taxa)}
            {entrega && ` (entrega ${brl(taxa)})`}
          </b>
        </p>
        <button className="botao" disabled={linhas.length === 0 || (!mesa && !pagamento)}>
          {enviando ? 'Enviando…' : mesa ? `Lançar na mesa ${mesa}` : 'Lançar pedido'}
        </button>
      </fieldset>
      {erro && (
        <p role="alert" className="erro">
          {erro}
        </p>
      )}
    </form>
  )
}
