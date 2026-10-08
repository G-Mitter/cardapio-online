'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useOptimistic, useState, useTransition } from 'react'

import { rotuloAgendamento } from '@/lib/agendamento'
import { brl, formatarCpf, rotuloPagamento } from '@/lib/pedido'
import { avisoDeStatus, PROXIMO, ROTULO, rotuloTipo, type Status } from '@/lib/pedidosDoDia'
import { whatsappUrl } from '@/lib/whatsapp'

import { montarRota, mudarStatus, type Rota } from '@/app/(frontend)/painel/actions'

export type PedidoView = {
  id: number
  numero: number
  status: Status
  createdAt: string
  nome: string
  telefone: string
  modo: 'entrega' | 'retirada'
  balcao: boolean
  endereco: string
  observacoes: string
  /** ISO; só em pedido agendado. */
  agendadoPara: string | null
  pagamento: string
  trocoPara: number | null
  cpf: string
  /** Retirada com código: para marcar Entregue, a loja digita o código do cliente. */
  pedeCodigo: boolean
  total: number
  itens: { nome: string; quantidade: number; opcoes: string }[]
}

/** Busca pedidos novos sozinha a cada 20 segundos, sem recarregar a página. */
const ATUALIZA_MS = 20_000

const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })

export function PainelPedidos({ pedidos, loja }: { pedidos: PedidoView[]; loja: string }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [naRota, setNaRota] = useState<number[]>([])
  // A troca de status aparece na hora; se o servidor recusar, a próxima atualização desfaz.
  const [lista, trocar] = useOptimistic(
    pedidos,
    (atual, { id, status }: { id: number; status: Status }) =>
      atual.map((p) => (p.id === id ? { ...p, status } : p)),
  )

  useEffect(() => {
    const t = setInterval(() => router.refresh(), ATUALIZA_MS)
    return () => clearInterval(t)
  }, [router])

  const aviso = (p: PedidoView, status: Status) =>
    p.telefone ? whatsappUrl(p.telefone, avisoDeStatus({ ...p, status, loja }) ?? undefined) : null

  function mudar(p: PedidoView, status: Status) {
    const id = p.id
    // Abre já no toque: o navegador bloqueia janelas abertas depois de esperar o servidor.
    const link = aviso(p, status)
    if (link) window.open(link, '_blank', 'noopener')
    startTransition(async () => {
      trocar({ id, status })
      await mudarStatus(id, status)
      router.refresh()
    })
  }

  if (!lista.length) {
    return <p className="pedidos-vazio">Nenhum pedido hoje ainda. A lista se atualiza sozinha.</p>
  }

  const abertos = lista.filter((p) => PROXIMO[p.status]).length
  return (
    <div className="pedidos">
      <p>
        {abertos} em aberto · {lista.length} hoje. A lista se atualiza sozinha.
      </p>
      <MontarRota escolhidos={naRota} aoLimpar={() => setNaRota([])} />
      {lista.map((p) => {
        const proximo = PROXIMO[p.status]
        const avisoAtual = p.status !== 'novo' && aviso(p, p.status)
        return (
          <article key={p.id} className={`pedido pedido--${p.status}`}>
            <header>
              <b>Nº {p.numero}</b>
              <span>{hora(p.createdAt)}</span>
              <span className="pedido__status">{ROTULO[p.status]}</span>
            </header>
            <div>
              <b>{p.nome}</b>
              {p.telefone && (
                <>
                  {' '}
                  · <a href={`tel:${p.telefone}`}>{p.telefone}</a>
                </>
              )}{' '}
              · {p.modo === 'entrega' ? `Entrega: ${p.endereco}` : rotuloTipo(p.modo, p.balcao)}
            </div>
            {p.modo === 'entrega' && p.endereco && PROXIMO[p.status] && (
              <label className="marcar">
                <input
                  type="checkbox"
                  checked={naRota.includes(p.id)}
                  onChange={(e) =>
                    setNaRota((ids) =>
                      e.target.checked ? [...ids, p.id] : ids.filter((id) => id !== p.id),
                    )
                  }
                />
                Vai na rota do entregador
              </label>
            )}
            <ul>
              {p.itens.map((i, n) => (
                <li key={n}>
                  {i.quantidade}× {i.nome}
                  {i.opcoes && <small> ({i.opcoes})</small>}
                </li>
              ))}
            </ul>
            {p.agendadoPara && (
              <div>
                <b>Agendado para {rotuloAgendamento(p.agendadoPara)}</b>
              </div>
            )}
            {p.observacoes && <div className="pedido__obs">Obs.: {p.observacoes}</div>}
            {p.cpf && <div>CPF na nota: {formatarCpf(p.cpf)}</div>}
            <footer>
              <b>
                {brl(p.total)}
                {p.pagamento && ` · ${rotuloPagamento(p.pagamento)}`}
                {p.trocoPara ? ` (troco para ${brl(p.trocoPara)})` : ''}
              </b>
              <div className="pedido__acoes">
                {proximo === 'entregue' && p.pedeCodigo ? (
                  <ConferirCodigo
                    aoConferir={async (codigo) => {
                      const r = await mudarStatus(p.id, 'entregue', codigo)
                      if (r.ok) router.refresh()
                      return r.ok ? '' : (r.erro ?? 'Não foi possível salvar. Tente de novo.')
                    }}
                  />
                ) : (
                  proximo && (
                    <button type="button" className="botao" onClick={() => mudar(p, proximo)}>
                      {ROTULO[proximo]}
                    </button>
                  )
                )}
                {p.status !== 'cancelado' && p.status !== 'entregue' && (
                  <button
                    type="button"
                    className="botao secundario"
                    onClick={() => mudar(p, 'cancelado')}
                  >
                    Cancelar
                  </button>
                )}
                {avisoAtual && (
                  <a className="botao secundario" href={avisoAtual} target="_blank" rel="noopener">
                    Avisar cliente
                  </a>
                )}
              </div>
            </footer>
          </article>
        )
      })}
    </div>
  )
}

/** Pedidos marcados viram uma rota no Google Maps para mandar ao entregador pelo WhatsApp. */
function MontarRota({ escolhidos, aoLimpar }: { escolhidos: number[]; aoLimpar: () => void }) {
  const [rota, setRota] = useState<Rota | null>(null)
  const [montando, startTransition] = useTransition()

  if (rota?.ok) {
    const texto = `Rota de entrega: pedidos ${rota.numeros.map((n) => `nº ${n}`).join(', ')}\n${rota.link}`
    return (
      <section className="rota">
        <p>
          <b>Ordem das entregas:</b> {rota.numeros.map((n) => `nº ${n}`).join(' → ')}
          {!rota.otimizada && ' (na ordem dos pedidos; o Google não ordenou desta vez)'}
        </p>
        <div className="pedido__acoes">
          <a
            className="botao"
            href={`https://wa.me/?text=${encodeURIComponent(texto)}`}
            target="_blank"
            rel="noopener"
          >
            Mandar para o entregador
          </a>
          <a className="botao secundario" href={rota.link} target="_blank" rel="noopener">
            Ver no Maps
          </a>
          <button
            type="button"
            className="botao secundario"
            onClick={() => {
              setRota(null)
              aoLimpar()
            }}
          >
            Nova rota
          </button>
        </div>
      </section>
    )
  }

  if (!escolhidos.length) return null
  return (
    <section className="rota rota--fixa">
      <button
        type="button"
        className="botao"
        disabled={montando}
        onClick={() => startTransition(async () => setRota(await montarRota(escolhidos)))}
      >
        {montando ? 'Montando a rota…' : `Montar rota (${escolhidos.length})`}
      </button>
      {rota && !rota.ok && <p className="erro">{rota.erro}</p>}
    </section>
  )
}

/** Retirada: a loja confere o nome, digita o código que o cliente mostra e só então entrega. */
function ConferirCodigo({ aoConferir }: { aoConferir: (codigo: string) => Promise<string> }) {
  const [erro, setErro] = useState('')
  const [enviando, startTransition] = useTransition()
  return (
    <form
      className="conferir-codigo"
      onSubmit={(e) => {
        e.preventDefault()
        const codigo = String(new FormData(e.currentTarget).get('codigo') ?? '')
        startTransition(async () => setErro(await aoConferir(codigo)))
      }}
    >
      <input
        name="codigo"
        aria-label="Código de retirada"
        placeholder="Código"
        inputMode="numeric"
        pattern="[0-9]{4}"
        maxLength={4}
        required
        autoComplete="off"
      />
      <button className="botao" disabled={enviando}>
        {enviando ? 'Conferindo…' : 'Entregue'}
      </button>
      {erro && <p className="erro">{erro}</p>}
    </form>
  )
}
