'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState, useTransition } from 'react'

import { criarPedido, type ResultadoPedido } from '@/app/(frontend)/actions'
import { type ClienteEscolhido, Identificacao } from '@/components/Identificacao'
import { brl, FORMAS_PAGAMENTO, type FormaPagamento, type Modo } from '@/lib/pedido'
import { normalizar } from '@/lib/planilha'

/** Endereço da imagem. O texto para leitor de tela vem do nome do produto ou da loja. */
type Foto = string | null

export type ProdutoView = {
  id: number
  nome: string
  descricao: string
  preco: number
  esgotado: boolean
  foto: Foto
}

export type CategoriaView = { id: number; nome: string; produtos: ProdutoView[] }

type LojaView = {
  slug: string
  nome: string
  logo: Foto
  capa: Foto
  horario: string
  endereco: string
  aberta: boolean
  fazEntrega: boolean
  aceitaRetirada: boolean
  taxaEntrega: number
  pagamentos: FormaPagamento[]
}

/** Cardápio que o cliente final vê: escolhe produtos, monta o carrinho e envia no WhatsApp. */
export function Cardapio({ loja, categorias }: { loja: LojaView; categorias: CategoriaView[] }) {
  // Carrinho: id do produto → quantidade.
  const [carrinho, setCarrinho] = useState<Record<number, number>>({})
  const [modo, setModo] = useState<Modo>(loja.fazEntrega ? 'entrega' : 'retirada')
  const [resultado, setResultado] = useState<ResultadoPedido | null>(null)
  const [cliente, setCliente] = useState<ClienteEscolhido | null>(null)
  const [enviando, startTransition] = useTransition()
  const dialogo = useRef<HTMLDialogElement>(null)
  const [busca, setBusca] = useState('')

  // Busca sem acento e sem diferença de maiúsculas, no nome e na descrição.
  const termo = normalizar(busca)
  const visiveis = termo
    ? categorias
        .map((c) => ({
          ...c,
          produtos: c.produtos.filter((p) =>
            normalizar(`${p.nome} ${p.descricao}`).includes(termo),
          ),
        }))
        .filter((c) => c.produtos.length > 0)
    : categorias

  const produtos = categorias.flatMap((c) => c.produtos)
  const itens = produtos.filter((p) => carrinho[p.id])
  const quantidade = itens.reduce((s, p) => s + carrinho[p.id], 0)
  // Só para mostrar na tela; o valor que vale é o que o servidor recalcula.
  const subtotal = itens.reduce((s, p) => s + p.preco * carrinho[p.id], 0)
  const taxa = modo === 'entrega' ? loja.taxaEntrega : 0

  const mudar = (id: number, delta: number) =>
    setCarrinho((c) => {
      const q = (c[id] ?? 0) + delta
      const novo = { ...c }
      if (q > 0) novo[id] = q
      else delete novo[id]
      return novo
    })

  function enviar(form: FormData) {
    startTransition(async () => {
      const r = await criarPedido({
        loja: loja.slug,
        itens: itens.map((p) => ({ produto: p.id, quantidade: carrinho[p.id] })),
        modo,
        telefone: cliente?.telefone ?? '',
        enderecoId: cliente?.enderecoId,
        observacoes: String(form.get('observacoes') ?? ''),
      })
      setResultado(r)
      if (r.ok) {
        setCarrinho({})
        window.location.href = r.link
      }
    })
  }

  return (
    <>
      <div className="wrap">
        <header className="loja">
          {loja.capa && (
            <div className="capa">
              {/* Decorativa: o nome da loja já vem logo abaixo. */}
              <Image src={loja.capa} alt="" fill priority sizes="(max-width: 520px) 100vw, 480px" />
            </div>
          )}
          <div className="logo">
            {loja.logo ? (
              <Image src={loja.logo} alt={`Logo da ${loja.nome}`} fill sizes="56px" />
            ) : (
              loja.nome[0]
            )}
          </div>
          <h1>{loja.nome}</h1>
          <div className="info">
            <span className={`status ${loja.aberta ? '' : 'fechada'}`}>
              {loja.aberta ? 'Recebendo pedidos' : 'Pedidos pausados'}
            </span>
            {loja.horario && <span>{loja.horario}</span>}
            {loja.fazEntrega && <span>Entrega {brl(loja.taxaEntrega)}</span>}
            {loja.endereco && <span>{loja.endereco}</span>}
            {loja.pagamentos.length > 0 && (
              <span>
                Pagamento:{' '}
                {FORMAS_PAGAMENTO.filter((f) => loja.pagamentos.includes(f.value))
                  .map((f) => f.label)
                  .join(', ')}
              </span>
            )}
          </div>
        </header>

        {categorias.length > 0 && (
          <input
            type="search"
            className="busca"
            placeholder="Buscar no cardápio"
            aria-label="Buscar no cardápio"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        )}

        {!termo && categorias.length > 1 && (
          <nav className="cats" aria-label="Categorias">
            {categorias.map((c) => (
              <a key={c.id} href={`#cat-${c.id}`}>
                {c.nome}
              </a>
            ))}
          </nav>
        )}

        {categorias.length === 0 && <p className="vazio">O cardápio ainda está sendo montado.</p>}

        {termo && visiveis.length === 0 && (
          <p className="vazio">Nada encontrado para &ldquo;{busca}&rdquo;.</p>
        )}

        {visiveis.map((c) => (
          <section key={c.id} id={`cat-${c.id}`}>
            <h2>{c.nome}</h2>
            {c.produtos.map((p) => {
              const q = carrinho[p.id] ?? 0
              return (
                <article key={p.id} className={`item ${p.esgotado ? 'esgotado' : ''}`}>
                  <div>
                    <h3>{p.nome}</h3>
                    {p.descricao && <p>{p.descricao}</p>}
                    <div className="preco">{brl(p.preco)}</div>
                    {p.esgotado ? (
                      <div className="tag">Esgotado</div>
                    ) : !loja.aberta ? null : q ? (
                      <div className="qtd">
                        <button onClick={() => mudar(p.id, -1)} aria-label={`Tirar um ${p.nome}`}>
                          −
                        </button>
                        <b>{q}</b>
                        <button onClick={() => mudar(p.id, 1)} aria-label={`Mais um ${p.nome}`}>
                          +
                        </button>
                      </div>
                    ) : (
                      <button className="add" onClick={() => mudar(p.id, 1)}>
                        Adicionar
                      </button>
                    )}
                  </div>
                  <div className="foto" aria-hidden={!p.foto}>
                    {p.foto ? <Image src={p.foto} alt={p.nome} fill sizes="84px" /> : p.nome[0]}
                  </div>
                </article>
              )
            })}
          </section>
        ))}

        <footer className="rodape">
          <Link href="/termos">Termos de uso</Link>
          <Link href="/privacidade">Privacidade</Link>
        </footer>
      </div>

      {quantidade > 0 && (
        <div className="barra">
          <button
            onClick={() => {
              setResultado(null)
              dialogo.current?.showModal()
            }}
          >
            <span>
              Ver pedido ({quantidade} {quantidade > 1 ? 'itens' : 'item'})
            </span>
            <span>{brl(subtotal)}</span>
          </button>
        </div>
      )}

      <dialog ref={dialogo} className="carrinho" aria-labelledby="titulo-pedido">
        <button className="fechar" onClick={() => dialogo.current?.close()}>
          Fechar
        </button>
        <h2 id="titulo-pedido">Seu pedido</h2>

        {resultado?.ok ? (
          <div className="enviado">
            <p>
              Pedido nº {resultado.numero} registrado. Se o WhatsApp não abriu sozinho, toque abaixo
              para enviar a mensagem para a loja.
            </p>
            <a className="enviar" href={resultado.link}>
              Abrir no WhatsApp
            </a>
          </div>
        ) : (
          <>
            {itens.map((p) => (
              <div key={p.id} className="linha">
                <span>
                  {carrinho[p.id]}× {p.nome}
                </span>
                <span>{brl(p.preco * carrinho[p.id])}</span>
              </div>
            ))}
            {taxa > 0 && (
              <div className="linha">
                <span>Taxa de entrega</span>
                <span>{brl(taxa)}</span>
              </div>
            )}
            <div className="linha total">
              <span>Total</span>
              <span>{brl(subtotal + taxa)}</span>
            </div>

            {loja.fazEntrega && loja.aceitaRetirada && (
              <fieldset className="modo">
                <legend>Como quer receber?</legend>
                <label>
                  <input
                    type="radio"
                    name="modo"
                    checked={modo === 'entrega'}
                    onChange={() => setModo('entrega')}
                  />
                  Entrega
                </label>
                <label>
                  <input
                    type="radio"
                    name="modo"
                    checked={modo === 'retirada'}
                    onChange={() => setModo('retirada')}
                  />
                  Retirar na loja
                </label>
              </fieldset>
            )}
            <Identificacao modo={modo} aoMudar={setCliente} />

            {/* onSubmit em vez de action: assim o React não limpa os campos quando o servidor devolve um erro. */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                enviar(new FormData(e.currentTarget))
              }}
            >
              <label>
                Observações
                <textarea name="observacoes" rows={2} maxLength={300} />
              </label>
              <p className="aviso-dados">
                Seu cadastro fica guardado para os próximos pedidos. Nome e endereço vão só para a
                loja que recebe o pedido.{' '}
                <a href="/privacidade" target="_blank">
                  Privacidade
                </a>
              </p>
              {resultado && !resultado.ok && (
                <p className="erro" role="alert">
                  {resultado.erro}
                </p>
              )}
              <button
                className="enviar"
                disabled={enviando || !cliente || (modo === 'entrega' && !cliente.enderecoId)}
              >
                {enviando ? 'Enviando…' : 'Enviar pedido no WhatsApp'}
              </button>
            </form>
          </>
        )}
      </dialog>
    </>
  )
}
