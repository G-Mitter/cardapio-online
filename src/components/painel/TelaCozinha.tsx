'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useOptimistic, useRef, useState, useTransition } from 'react'

import { rotuloAgendamento } from '@/lib/agendamento'
import { PROXIMO, ROTULO, rotuloTipo, type Status } from '@/lib/pedidosDoDia'

import { mudarStatus } from '@/app/(frontend)/painel/actions'

type PedidoCozinha = {
  id: number
  numero: number
  status: 'novo' | 'preparando' | 'pronto'
  createdAt: string
  nome: string
  modo: 'entrega' | 'retirada'
  balcao: boolean
  mesa: string
  agendadoPara: string | null
  observacoes: string
  itens: { nome: string; quantidade: number; opcoes: string }[]
}

const COLUNAS = ['novo', 'preparando', 'pronto'] as const
const ATUALIZA_MS = 5_000

const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })

/** Três toques curtos. O navegador só libera som depois de um toque do usuário (botão "Ativar som"). */
function apitar(ctx: AudioContext) {
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator()
    osc.frequency.value = 880
    osc.connect(ctx.destination)
    osc.start(ctx.currentTime + i * 0.25)
    osc.stop(ctx.currentTime + i * 0.25 + 0.15)
  }
}

export function TelaCozinha({ pedidos }: { pedidos: PedidoCozinha[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [som, setSom] = useState(false)
  const audio = useRef<AudioContext | null>(null)
  const vistos = useRef<Set<number> | null>(null)
  const [lista, trocar] = useOptimistic(
    pedidos,
    (atual, { id, status }: { id: number; status: Status }) =>
      atual.map((p) => (p.id === id ? { ...p, status: status as PedidoCozinha['status'] } : p)),
  )

  useEffect(() => {
    const t = setInterval(() => router.refresh(), ATUALIZA_MS)
    return () => clearInterval(t)
  }, [router])

  // Apita quando aparece pedido novo que a tela ainda não tinha visto (a primeira carga não apita).
  useEffect(() => {
    const ids = new Set(pedidos.filter((p) => p.status === 'novo').map((p) => p.id))
    const anteriores = vistos.current
    vistos.current = ids
    if (anteriores && audio.current && [...ids].some((id) => !anteriores.has(id))) apitar(audio.current)
  }, [pedidos])

  function ativarSom() {
    audio.current ??= new AudioContext()
    void audio.current.resume()
    apitar(audio.current)
    setSom(true)
  }

  function avancar(p: PedidoCozinha) {
    const proximo = PROXIMO[p.status]
    if (!proximo) return
    startTransition(async () => {
      trocar({ id: p.id, status: proximo })
      await mudarStatus(p.id, proximo)
      router.refresh()
    })
  }

  return (
    <div className="cozinha">
      <div className="cozinha__topo">
        <h1>Cozinha</h1>
        {som ? (
          <span>Som ligado</span>
        ) : (
          <button type="button" className="botao secundario" onClick={ativarSom}>
            Ativar som
          </button>
        )}
      </div>
      <div className="cozinha__colunas">
        {COLUNAS.map((status) => {
          const cartoes = lista.filter((p) => p.status === status)
          return (
            <section key={status} className={`cozinha__coluna cozinha__coluna--${status}`}>
              <h2>
                {ROTULO[status]} ({cartoes.length})
              </h2>
              {cartoes.map((p) => {
                const proximo = PROXIMO[p.status]
                // "Pronto" fica só para ver: entregar passa pelo painel de pedidos (pode pedir o código de retirada).
                const toque = p.status !== 'pronto'
                return (
                  <article
                    key={p.id}
                    className="cozinha__cartao"
                    onClick={toque ? () => avancar(p) : undefined}
                    role={toque ? 'button' : undefined}
                    tabIndex={toque ? 0 : undefined}
                    onKeyDown={
                      toque
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') avancar(p)
                          }
                        : undefined
                    }
                    aria-label={toque && proximo ? `Pedido ${p.numero}: marcar como ${ROTULO[proximo]}` : undefined}
                  >
                    <header>
                      <b>Nº {p.numero}</b>
                      <span>
                        {hora(p.createdAt)} · {rotuloTipo(p.modo, p.balcao, p.mesa)}
                      </span>
                    </header>
                    <ul>
                      {p.itens.map((i, n) => (
                        <li key={n}>
                          <b>{i.quantidade}×</b> {i.nome}
                          {i.opcoes && <small> ({i.opcoes})</small>}
                        </li>
                      ))}
                    </ul>
                    {p.agendadoPara && <div>Agendado para {rotuloAgendamento(p.agendadoPara)}</div>}
                    {p.observacoes && <div className="cozinha__obs">Obs.: {p.observacoes}</div>}
                    {toque && proximo && <div className="cozinha__acao">Toque: {ROTULO[proximo]}</div>}
                  </article>
                )
              })}
            </section>
          )
        })}
      </div>
    </div>
  )
}
