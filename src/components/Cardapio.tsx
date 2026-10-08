'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState, useTransition } from 'react'

import { criarPedido, type ResultadoPedido } from '@/app/(frontend)/actions'
import { type ClienteEscolhido, Identificacao } from '@/components/Identificacao'
import { brl, FORMAS_PAGAMENTO, type FormaPagamento, type Modo } from '@/lib/pedido'
import type { Bairro } from '@/lib/entrega'
import { type Escolhas, type GrupoOpcao, resolverEscolhas } from '@/lib/opcoes'
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
  /** Tamanho, borda, extras... Vazio = produto sem opções. */
  opcoes: GrupoOpcao[]
}

/** Uma linha do carrinho: o mesmo produto com opções diferentes são linhas diferentes. */
type Linha = { chave: string; produto: number; escolhas: Escolhas; quantidade: number }

const chaveDe = (produto: number, escolhas: Escolhas) =>
  `${produto}:${JSON.stringify(Object.entries(escolhas).filter(([, v]) => v.length).sort())}`

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
  /** Se houver, a loja entrega só nestes bairros (cada um com a sua taxa). */
  bairros: Bairro[]
  pagamentos: FormaPagamento[]
}

/** Cardápio que o cliente final vê: escolhe produtos, monta o carrinho e finaliza o pedido no site. */
export function Cardapio({ loja, categorias }: { loja: LojaView; categorias: CategoriaView[] }) {
  const [linhas, setLinhas] = useState<Linha[]>([])
  // Produto com opções aberto para escolher tamanho, extras...
  const [configurando, setConfigurando] = useState<ProdutoView | null>(null)
  const [selecao, setSelecao] = useState<Escolhas>({})
  const [erroOpcoes, setErroOpcoes] = useState('')
  const dialogoOpcoes = useRef<HTMLDialogElement>(null)
  const [modo, setModo] = useState<Modo>(loja.fazEntrega ? 'entrega' : 'retirada')
  const [resultado, setResultado] = useState<ResultadoPedido | null>(null)
  const [cliente, setCliente] = useState<ClienteEscolhido | null>(null)
  const [pagamento, setPagamento] = useState<FormaPagamento | undefined>(loja.pagamentos[0])
  const [cpfNaNota, setCpfNaNota] = useState(false)
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
  const itens = linhas.flatMap((l) => {
    const p = produtos.find((x) => x.id === l.produto)
    if (!p) return []
    const o = resolverEscolhas(p.opcoes, l.escolhas)
    return [{ ...l, p, descricao: o.ok ? o.descricao : '', preco: p.preco + (o.ok ? o.adicional : 0) }]
  })
  const quantidade = itens.reduce((s, i) => s + i.quantidade, 0)
  // Só para mostrar na tela; o valor que vale é o que o servidor recalcula.
  const subtotal = itens.reduce((s, i) => s + i.preco * i.quantidade, 0)
  const noPedido = (id: number) => itens.filter((i) => i.produto === id).reduce((s, i) => s + i.quantidade, 0)
  const entrega = modo === 'entrega'
  // Com bairros, a taxa depende do endereço escolhido (calculada no servidor, junto do cadastro).
  const semEntrega = entrega && cliente?.taxa === null
  const taxa = !entrega ? 0 : loja.bairros.length ? (cliente?.taxa ?? 0) : loja.taxaEntrega

  /** Soma (ou tira) `delta` da linha; cria a linha se for nova e apaga se zerar. */
  const mudar = (produto: number, escolhas: Escolhas, delta: number) =>
    setLinhas((ls) => {
      const chave = chaveDe(produto, escolhas)
      const q = (ls.find((l) => l.chave === chave)?.quantidade ?? 0) + delta
      if (q <= 0) return ls.filter((l) => l.chave !== chave)
      return ls.some((l) => l.chave === chave)
        ? ls.map((l) => (l.chave === chave ? { ...l, quantidade: q } : l))
        : [...ls, { chave, produto, escolhas, quantidade: q }]
    })

  function escolherOpcoes(p: ProdutoView) {
    setConfigurando(p)
    setSelecao({})
    setErroOpcoes('')
    dialogoOpcoes.current?.showModal()
  }

  function marcar(g: GrupoOpcao, itemId: string, marcado: boolean) {
    setSelecao((s) => {
      const atual = s[g.id] ?? []
      if (g.max === 1) return { ...s, [g.id]: [itemId] }
      return { ...s, [g.id]: marcado ? [...atual, itemId] : atual.filter((id) => id !== itemId) }
    })
  }

  const confirmacao = configurando && resolverEscolhas(configurando.opcoes, selecao)
  function confirmarOpcoes() {
    if (!configurando || !confirmacao) return
    if (!confirmacao.ok) return setErroOpcoes(confirmacao.erro)
    mudar(configurando.id, selecao, 1)
    dialogoOpcoes.current?.close()
  }

  function enviar(form: FormData) {
    startTransition(async () => {
      const r = await criarPedido({
        loja: loja.slug,
        itens: itens.map((i) => ({ produto: i.produto, quantidade: i.quantidade, escolhas: i.escolhas })),
        modo,
        telefone: cliente?.telefone ?? '',
        enderecoId: cliente?.enderecoId,
        observacoes: String(form.get('observacoes') ?? ''),
        pagamento: pagamento!,
        trocoPara: String(form.get('trocoPara') ?? ''),
        cpf: cpfNaNota ? String(form.get('cpf') ?? '') : '',
      })
      setResultado(r)
      if (r.ok) setLinhas([])
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
            {loja.fazEntrega && <span>{textoEntrega(loja)}</span>}
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
              const q = noPedido(p.id)
              return (
                <article key={p.id} className={`item ${p.esgotado ? 'esgotado' : ''}`}>
                  <div>
                    <h3>{p.nome}</h3>
                    {p.descricao && <p>{p.descricao}</p>}
                    <div className="preco">{brl(p.preco)}</div>
                    {p.esgotado ? (
                      <div className="tag">Esgotado</div>
                    ) : !loja.aberta ? null : p.opcoes.length ? (
                      <button className="add" onClick={() => escolherOpcoes(p)}>
                        {q ? `Escolher mais uma (${q} no pedido)` : 'Escolher opções'}
                      </button>
                    ) : q ? (
                      <div className="qtd">
                        <button onClick={() => mudar(p.id, {}, -1)} aria-label={`Tirar um ${p.nome}`}>
                          −
                        </button>
                        <b>{q}</b>
                        <button onClick={() => mudar(p.id, {}, 1)} aria-label={`Mais um ${p.nome}`}>
                          +
                        </button>
                      </div>
                    ) : (
                      <button className="add" onClick={() => mudar(p.id, {}, 1)}>
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

      <dialog
        ref={dialogoOpcoes}
        className="carrinho"
        aria-labelledby="titulo-opcoes"
        onClose={() => setConfigurando(null)}
      >
        <button className="fechar" onClick={() => dialogoOpcoes.current?.close()}>
          Fechar
        </button>
        {configurando && (
          <>
            <h2 id="titulo-opcoes">{configurando.nome}</h2>
            {configurando.opcoes.map((g) => (
              <fieldset key={g.id} className="modo opcoes-grupo">
                <legend>
                  {g.nome}
                  <small>
                    {' '}
                    · {g.min > 0 ? 'obrigatório' : 'opcional'}
                    {g.max > 1 ? `, até ${g.max}` : ''}
                  </small>
                </legend>
                {g.itens.map((i) => {
                  const marcados = selecao[g.id] ?? []
                  const marcado = marcados.includes(i.id)
                  return (
                    <label key={i.id}>
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
            {erroOpcoes && (
              <p className="erro" role="alert">
                {erroOpcoes}
              </p>
            )}
            <button className="enviar" onClick={confirmarOpcoes}>
              Adicionar ao pedido
              {confirmacao?.ok && ` · ${brl(configurando.preco + confirmacao.adicional)}`}
            </button>
          </>
        )}
      </dialog>

      <dialog ref={dialogo} className="carrinho" aria-labelledby="titulo-pedido">
        <button className="fechar" onClick={() => dialogo.current?.close()}>
          Fechar
        </button>
        <h2 id="titulo-pedido">Seu pedido</h2>

        {resultado?.ok ? (
          <div className="enviado">
            <p>
              <strong>Pedido nº {resultado.numero} recebido!</strong> A loja já está vendo o seu
              pedido. Para acompanhar ou tirar dúvidas, fale com a loja pelo WhatsApp; a mensagem já
              vai com o número e os itens do pedido.
            </p>
            {resultado.codigoRetirada && (
              <p className="codigo-retirada">
                Código de retirada <strong>{resultado.codigoRetirada}</strong>
                <span>Mostre este código na loja para retirar o pedido.</span>
              </p>
            )}
            {resultado.pix && <PagarComPix {...resultado.pix} />}
            <a className="enviar" href={resultado.link} target="_blank" rel="noopener">
              Acompanhar pelo WhatsApp
            </a>
          </div>
        ) : (
          <>
            {itens.map((i) => (
              <div key={i.chave} className="linha">
                <span>
                  {i.quantidade}× {i.p.nome}
                  {i.descricao && <small className="opcoes-escolhidas"> ({i.descricao})</small>}
                  {i.p.opcoes.length > 0 && (
                    <button
                      type="button"
                      className="link"
                      onClick={() => mudar(i.produto, i.escolhas, -1)}
                      aria-label={`Tirar um ${i.p.nome}`}
                    >
                      Tirar um
                    </button>
                  )}
                </span>
                <span>{brl(i.preco * i.quantidade)}</span>
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
            <Identificacao loja={loja.slug} modo={modo} aoMudar={setCliente} />

            {/* onSubmit em vez de action: assim o React não limpa os campos quando o servidor devolve um erro. */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                enviar(new FormData(e.currentTarget))
              }}
            >
              <fieldset className="modo pagamento">
                <legend>Pagamento na {modo === 'entrega' ? 'entrega' : 'retirada'}</legend>
                {FORMAS_PAGAMENTO.filter((f) => loja.pagamentos.includes(f.value)).map((f) => (
                  <label key={f.value}>
                    <input
                      type="radio"
                      name="pagamento"
                      checked={pagamento === f.value}
                      onChange={() => setPagamento(f.value)}
                    />
                    {f.label}
                  </label>
                ))}
              </fieldset>
              {pagamento === 'dinheiro' && (
                <label>
                  Troco para quanto? (deixe vazio se não precisa)
                  <input
                    name="trocoPara"
                    inputMode="decimal"
                    placeholder="Ex.: 50"
                    maxLength={10}
                  />
                </label>
              )}
              <label className="marcar">
                <input
                  type="checkbox"
                  checked={cpfNaNota}
                  onChange={(e) => setCpfNaNota(e.target.checked)}
                />
                CPF na nota
              </label>
              {cpfNaNota && (
                <label>
                  CPF
                  <input
                    name="cpf"
                    inputMode="numeric"
                    required
                    maxLength={14}
                    placeholder="000.000.000-00"
                  />
                </label>
              )}
              <label>
                Observações
                <textarea name="observacoes" rows={2} maxLength={300} />
              </label>
              <p className="aviso-dados">
                Seu cadastro fica guardado para os próximos pedidos. Nome, endereço e CPF vão só
                para a loja que recebe o pedido; o CPF não fica no cadastro.{' '}
                <a href="/privacidade" target="_blank">
                  Privacidade
                </a>
              </p>
              {semEntrega && (
                <p className="erro" role="alert">
                  A loja não entrega no bairro deste endereço. Escolha outro endereço ou retire na loja.
                </p>
              )}
              {resultado && !resultado.ok && (
                <p className="erro" role="alert">
                  {resultado.erro}
                </p>
              )}
              <button
                className="enviar"
                disabled={
                  enviando ||
                  !cliente ||
                  !pagamento ||
                  (entrega && (!cliente.enderecoId || semEntrega))
                }
              >
                {enviando ? 'Enviando…' : 'Finalizar pedido'}
              </button>
            </form>
          </>
        )}
      </dialog>
    </>
  )
}

/** "Entrega R$ 6,00", ou a faixa quando há taxa por bairro. */
function textoEntrega(loja: LojaView) {
  const taxas = loja.bairros.map((b) => b.taxa)
  if (!taxas.length) return `Entrega ${brl(loja.taxaEntrega)}`
  const [min, max] = [Math.min(...taxas), Math.max(...taxas)]
  return min === max ? `Entrega ${brl(min)}` : `Entrega de ${brl(min)} a ${brl(max)}`
}

/** Chave Pix da loja para copiar. O cliente paga no app do banco e manda o comprovante no WhatsApp. */
function PagarComPix({ chave, valor }: { chave: string; valor: number }) {
  const [copiado, setCopiado] = useState(false)
  const campo = useRef<HTMLInputElement>(null)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(chave)
      setCopiado(true)
    } catch {
      // Sem permissão para a área de transferência: deixa o texto selecionado para copiar à mão.
      campo.current?.select()
    }
  }

  return (
    <div className="pix">
      <p>
        <strong>Pague {brl(valor)} com Pix</strong> no app do seu banco usando a chave abaixo.
        Depois, envie o comprovante para a loja pelo WhatsApp.
      </p>
      <div className="pix__chave">
        <input
          ref={campo}
          readOnly
          value={chave}
          aria-label="Chave Pix da loja"
          onFocus={(e) => e.target.select()}
        />
        <button type="button" className="secundario" onClick={copiar}>
          {copiado ? 'Copiada!' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}
