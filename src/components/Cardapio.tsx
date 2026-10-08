'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from 'react'

import {
  aplicarCupom,
  criarPedido,
  criarPedidoMesa,
  guardarCarrinho,
  repetirUltimoPedido,
  type ResultadoMesa,
  type ResultadoPedido,
} from '@/app/(frontend)/actions'
import { ContaDaMesa } from '@/components/ContaDaMesa'
import { type ClienteEscolhido, Identificacao } from '@/components/Identificacao'
import { limitesDoCampo } from '@/lib/agendamento'
import { normalizarCodigo } from '@/lib/cupom'
import { registrarCompra } from '@/lib/pixel'
import { brl, FORMAS_PAGAMENTO, type FormaPagamento, type Modo } from '@/lib/pedido'
import type { Bairro } from '@/lib/entrega'
import { type Escolhas, type GrupoOpcao, resolverEscolhas } from '@/lib/opcoes'
import { normalizar } from '@/lib/planilha'
import { descontoDePromocoes, type Promocao, rotuloPromocao } from '@/lib/promocao'
import { sugerir } from '@/lib/sugestoes'

/** Endereço da imagem. O texto para leitor de tela vem do nome do produto ou da loja. */
type Foto = string | null

export type ProdutoView = {
  id: number
  nome: string
  descricao: string
  preco: number
  esgotado: boolean
  foto: Foto
  /** "Leve 3, pague 2"; o carrinho mostra a conta, o servidor refaz. */
  promocao: Promocao | null
  /** Etiquetas ("Novo", "Promoção"...) já em texto. */
  selos: string[]
  /** Tamanho, borda, extras... Vazio = produto sem opções. */
  opcoes: GrupoOpcao[]
}

/** Uma linha do carrinho: o mesmo produto com opções diferentes são linhas diferentes. */
type Linha = { chave: string; produto: number; escolhas: Escolhas; quantidade: number }

const chaveDe = (produto: number, escolhas: Escolhas) =>
  `${produto}:${JSON.stringify(
    Object.entries(escolhas)
      .filter(([, v]) => v.length)
      .sort(),
  )}`

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
  aceitaAgendamento: boolean
  taxaEntrega: number
  /** Se houver, a loja entrega só nestes bairros (cada um com a sua taxa). */
  bairros: Bairro[]
  /** Mesas com QR Code; vazio = loja sem pedido pela mesa. */
  mesas: string[]
  /** Falso na loja que atende as mesas só com garçom: o cliente não envia pedido pelo QR Code. */
  pedeNaMesa: boolean
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
  // Mesa vem do QR Code (?mesa=3); só vale se a loja tiver essa mesa cadastrada.
  // Lida no navegador (a página do cardápio é guardada em cache e não pode depender da URL no servidor).
  const consulta = useSyncExternalStore(
    () => () => {},
    () => window.location.search,
    () => '',
  )
  const mesaDaUrl = new URLSearchParams(consulta).get('mesa')
  const mesa = mesaDaUrl && loja.mesas.includes(mesaDaUrl) ? mesaDaUrl : null
  const [resultadoMesa, setResultadoMesa] = useState<ResultadoMesa | null>(null)
  // Garçom logado que lê o QR da mesa vai direto para o lançamento dela (o cliente continua aqui).
  useEffect(() => {
    if (!mesa) return
    fetch('/api/users/me')
      .then((r) => r.json())
      .then(({ user }) => {
        if (user?.roles?.includes('garcom') && user.ativo !== false) {
          window.location.replace(`/painel/garcom/${encodeURIComponent(mesa)}`)
        }
      })
      .catch(() => {})
  }, [mesa])
  const [cliente, setCliente] = useState<ClienteEscolhido | null>(null)
  const [pagamento, setPagamento] = useState<FormaPagamento | undefined>(loja.pagamentos[0])
  const [cpfNaNota, setCpfNaNota] = useState(false)
  const [agendar, setAgendar] = useState(false)
  const [enviando, startTransition] = useTransition()
  const [repetindo, startRepetir] = useTransition()
  const [avisoRepetir, setAvisoRepetir] = useState('')
  // Cupom: o que o cliente digitou, o código aplicado e quanto ele abate (calculado no servidor).
  const [campoCupom, setCampoCupom] = useState('')
  const [cupom, setCupom] = useState<string | null>(null)
  const [desconto, setDesconto] = useState(0)
  const [erroCupom, setErroCupom] = useState('')
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
    return [
      { ...l, p, descricao: o.ok ? o.descricao : '', preco: p.preco + (o.ok ? o.adicional : 0) },
    ]
  })
  const quantidade = itens.reduce((s, i) => s + i.quantidade, 0)
  // Só para mostrar na tela; o valor que vale é o que o servidor recalcula.
  const subtotal = itens.reduce((s, i) => s + i.preco * i.quantidade, 0)
  const promocao = descontoDePromocoes(
    itens.map((i) => ({ produto: i.produto, precoUnitario: i.preco, quantidade: i.quantidade })),
    (id) => produtos.find((p) => p.id === Number(id))?.promocao ?? null,
  )
  const noPedido = (id: number) =>
    itens.filter((i) => i.produto === id).reduce((s, i) => s + i.quantidade, 0)
  const entrega = !mesa && modo === 'entrega'
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

  const abrirPedido = () => {
    setResultado(null)
    dialogo.current?.showModal()
  }

  /** Coloca no carrinho os itens do último pedido deste telefone nesta loja. */
  function repetir() {
    if (!cliente) return
    startRepetir(async () => {
      const r = await repetirUltimoPedido(cliente.telefone, loja.slug)
      if (!r.ok) return setAvisoRepetir(r.erro)
      for (const i of r.itens) mudar(i.produto, i.escolhas, i.quantidade)
      setAvisoRepetir(
        r.faltaram.length
          ? `Não deu para repetir: ${r.faltaram.join(', ')} (esgotou ou mudou no cardápio).`
          : '',
      )
    })
  }

  // Mexeu no carrinho com cupom aplicado: o desconto (e o mínimo do cupom) são conferidos de novo.
  const chaveCarrinho = linhas.map((l) => `${l.chave}x${l.quantidade}`).join('|')
  useEffect(() => {
    if (!cupom || !linhas.length) return
    let vivo = true
    aplicarCupom({
      loja: loja.slug,
      codigo: cupom,
      itens: linhas.map((l) => ({
        produto: l.produto,
        quantidade: l.quantidade,
        escolhas: l.escolhas,
      })),
    }).then((r) => {
      if (!vivo) return
      if (r.ok) {
        setDesconto(r.desconto)
        setErroCupom('')
      } else {
        setCupom(null)
        setDesconto(0)
        setErroCupom(r.erro)
      }
    })
    return () => {
      vivo = false
    }
    // linhas muda junto com chaveCarrinho; depender só da chave evita refazer a conta sem necessidade.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveCarrinho, cupom, loja.slug])

  // Quem já se identificou tem o carrinho guardado, para a loja poder chamar se o pedido não sair.
  // ponytail: sem trava contra a corrida entre este salvamento e o envio do pedido; no pior caso sobra um carrinho que a loja apaga.
  const telefoneCliente = cliente?.telefone
  useEffect(() => {
    if (!telefoneCliente) return
    const espera = setTimeout(() => {
      guardarCarrinho({
        loja: loja.slug,
        telefone: telefoneCliente,
        itens: linhas.map((l) => ({
          produto: l.produto,
          quantidade: l.quantidade,
          escolhas: l.escolhas,
        })),
      }).catch(() => {})
    }, 2000)
    return () => clearTimeout(espera)
    // linhas muda junto com chaveCarrinho.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveCarrinho, telefoneCliente, loja.slug])

  const sugestoes = sugerir(
    categorias,
    itens.map((i) => i.produto),
  )

  function enviar(form: FormData) {
    startTransition(async () => {
      const r = await criarPedido({
        loja: loja.slug,
        itens: itens.map((i) => ({
          produto: i.produto,
          quantidade: i.quantidade,
          escolhas: i.escolhas,
        })),
        modo,
        telefone: cliente?.telefone ?? '',
        enderecoId: cliente?.enderecoId,
        observacoes: String(form.get('observacoes') ?? ''),
        pagamento: pagamento!,
        trocoPara: String(form.get('trocoPara') ?? ''),
        cpf: cpfNaNota ? String(form.get('cpf') ?? '') : '',
        cupom: cupom ?? undefined,
        agendarPara: agendar ? String(form.get('agendarPara') ?? '') : undefined,
      })
      setResultado(r)
      if (r.ok) {
        registrarCompra(r.total)
        setLinhas([])
        setCupom(null)
        setDesconto(0)
        setCampoCupom('')
      }
    })
  }

  function enviarMesa(form: FormData) {
    if (!mesa) return
    startTransition(async () => {
      const r = await criarPedidoMesa({
        loja: loja.slug,
        mesa,
        itens: itens.map((i) => ({ produto: i.produto, quantidade: i.quantidade, escolhas: i.escolhas })),
        nome: String(form.get('nome') ?? ''),
        telefone: String(form.get('telefone') ?? ''),
        observacoes: String(form.get('observacoes') ?? ''),
      })
      setResultadoMesa(r)
      if (r.ok) {
        registrarCompra(r.total)
        setLinhas([])
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
            {mesa && <span className="status">Mesa {mesa}</span>}
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

        <ContaDaMesa loja={loja.slug} mesa={mesa} atualizar={resultadoMesa?.ok ? resultadoMesa.numero : 0} />

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

        {loja.aberta && categorias.length > 0 && linhas.length === 0 && (
          <button type="button" className="link repetir" onClick={abrirPedido}>
            Já pediu aqui? Repetir meu último pedido
          </button>
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
                    {(p.selos.length > 0 || p.promocao) && (
                      <div className="selos">
                        {[...p.selos, ...(p.promocao ? [rotuloPromocao(p.promocao)] : [])].map(
                          (s) => (
                            <span key={s} className="selo">
                              {s}
                            </span>
                          ),
                        )}
                      </div>
                    )}
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
                        <button
                          onClick={() => mudar(p.id, {}, -1)}
                          aria-label={`Tirar um ${p.nome}`}
                        >
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
          <button onClick={abrirPedido}>
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

        {resultadoMesa?.ok ? (
          <div className="enviado">
            <p>
              <strong>Pedido nº {resultadoMesa.numero} enviado para a cozinha!</strong> Quando terminar, é só pagar no
              caixa.
            </p>
            <button type="button" className="enviar" onClick={() => setResultadoMesa(null)}>
              Fazer outro pedido
            </button>
          </div>
        ) : resultado?.ok ? (
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
            {itens.length === 0 && <p className="vazio">Seu pedido está vazio.</p>}
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
            {itens.length > 0 && (
              <>
                {taxa > 0 && (
                  <div className="linha">
                    <span>Taxa de entrega</span>
                    <span>{brl(taxa)}</span>
                  </div>
                )}
                {promocao > 0 && (
                  <div className="linha">
                    <span>Promoção leve e pague menos</span>
                    <span>- {brl(promocao)}</span>
                  </div>
                )}
                {desconto > 0 && (
                  <div className="linha">
                    <span>Cupom {cupom}</span>
                    <span>- {brl(desconto)}</span>
                  </div>
                )}
                <div className="linha total">
                  <span>Total</span>
                  <span>{brl(subtotal + taxa - promocao - desconto)}</span>
                </div>
                {!mesa && (
                <div className="cupom">
                  {cupom ? (
                    <p>
                      Cupom <b>{cupom}</b> aplicado.{' '}
                      <button
                        type="button"
                        className="link"
                        onClick={() => {
                          setCupom(null)
                          setDesconto(0)
                        }}
                      >
                        Remover
                      </button>
                    </p>
                  ) : (
                    <div className="cupom__campo">
                      <input
                        value={campoCupom}
                        onChange={(e) => setCampoCupom(e.target.value)}
                        placeholder="Cupom de desconto"
                        aria-label="Cupom de desconto"
                        maxLength={20}
                      />
                      <button
                        type="button"
                        className="secundario"
                        disabled={!normalizarCodigo(campoCupom)}
                        onClick={() => {
                          setErroCupom('')
                          setCupom(normalizarCodigo(campoCupom))
                        }}
                      >
                        Aplicar
                      </button>
                    </div>
                  )}
                  {erroCupom && (
                    <p className="erro" role="alert">
                      {erroCupom}
                    </p>
                  )}
                </div>
                )}
              </>
            )}
            {itens.length > 0 && sugestoes.length > 0 && (
              <div className="sugestoes">
                <h3>Peça também</h3>
                {sugestoes.map((p) => (
                  <button key={p.id} type="button" onClick={() => mudar(p.id, {}, 1)}>
                    <span>{p.nome}</span>
                    <span>+ {brl(p.preco)}</span>
                  </button>
                ))}
              </div>
            )}

            {!mesa && loja.fazEntrega && loja.aceitaRetirada && (
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
            {!mesa && <Identificacao loja={loja.slug} modo={modo} aoMudar={setCliente} />}
            {!mesa && cliente && itens.length === 0 && (
              <>
                <button type="button" className="secundario" disabled={repetindo} onClick={repetir}>
                  {repetindo ? 'Procurando…' : 'Repetir meu último pedido'}
                </button>
                {avisoRepetir && (
                  <p className="erro" role="status">
                    {avisoRepetir}
                  </p>
                )}
              </>
            )}

            {mesa && itens.length > 0 && !loja.pedeNaMesa && (
              <p className="aviso-dados">Nesta loja os pedidos da mesa são feitos pelo garçom. Chame alguém da casa.</p>
            )}
            {mesa && itens.length > 0 && loja.pedeNaMesa && (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  enviarMesa(new FormData(e.currentTarget))
                }}
              >
                <label>
                  Seu nome (opcional)
                  <input name="nome" maxLength={100} autoComplete="given-name" />
                </label>
                <label>
                  Telefone (opcional)
                  <input name="telefone" type="tel" maxLength={20} autoComplete="tel" />
                </label>
                <label>
                  Observações
                  <textarea name="observacoes" rows={2} maxLength={300} />
                </label>
                <p className="aviso-dados">O pagamento é feito no caixa, quando você terminar.</p>
                {resultadoMesa && !resultadoMesa.ok && (
                  <p className="erro" role="alert">
                    {resultadoMesa.erro}
                  </p>
                )}
                <button className="enviar" disabled={enviando}>
                  {enviando ? 'Enviando…' : 'Enviar para a cozinha'}
                </button>
              </form>
            )}

            {/* onSubmit em vez de action: assim o React não limpa os campos quando o servidor devolve um erro. */}
            {!mesa && itens.length > 0 && (
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
                {loja.aceitaAgendamento && (
                  <>
                    <label className="marcar">
                      <input
                        type="checkbox"
                        checked={agendar}
                        onChange={(e) => setAgendar(e.target.checked)}
                      />
                      Agendar para outro dia ou hora
                    </label>
                    {agendar && (
                      <label>
                        {entrega ? 'Receber em' : 'Retirar em'}
                        <input
                          type="datetime-local"
                          name="agendarPara"
                          required
                          {...limitesDoCampo()}
                        />
                      </label>
                    )}
                  </>
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
                  para a loja que recebe o pedido; o CPF não fica no cadastro. Se você não
                  finalizar, a loja pode ver seu carrinho e chamar no WhatsApp.{' '}
                  <a href="/privacidade" target="_blank">
                    Privacidade
                  </a>
                </p>
                {semEntrega && (
                  <p className="erro" role="alert">
                    A loja não entrega no bairro deste endereço. Escolha outro endereço ou retire na
                    loja.
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
            )}
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
