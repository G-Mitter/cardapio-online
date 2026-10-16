'use client'

import { useRouter } from 'next/navigation'
import { type ReactNode, useRef, useSyncExternalStore } from 'react'

import type { Estado } from '@/app/(frontend)/painel/actions'

/**
 * Apagar do painel: pergunta "Tem certeza?" e, depois de confirmar, o item some e aparece o aviso
 * "apagado · Desfazer" embaixo da tela. O apagamento de verdade só acontece quando o aviso acaba
 * (8 segundos), então desfazer é só cancelar a espera. O aviso fica no layout e continua se a
 * pessoa mudar de tela; se ela fechar a aba antes, nada é apagado (o lado seguro).
 */
const ESPERA_MS = 8000

type Aviso = { id: number; texto: string; erro?: boolean; desfazer?: () => void }

let avisos: Aviso[] = []
/** Chaves ("produto:12") dos itens que já foram apagados ou esperam para ser. */
let escondidos: string[] = []
let proximoId = 1
const ouvintes = new Set<() => void>()
const emitir = () => ouvintes.forEach((f) => f())
const assinar = (f: () => void) => {
  ouvintes.add(f)
  return () => void ouvintes.delete(f)
}

function tirarAviso(id: number) {
  avisos = avisos.filter((a) => a.id !== id)
  emitir()
}

function mostrar(aviso: Omit<Aviso, 'id'>): number {
  const id = proximoId++
  avisos = [...avisos, { ...aviso, id }]
  emitir()
  return id
}

type Executar = () => Promise<Estado | void>

function adiar(chave: string, nome: string, executar: Executar) {
  escondidos = [...escondidos, chave]
  const espera = setTimeout(async () => {
    tirarAviso(id)
    const falhou = await executar().then(
      (r) => (r && r.erro) || '',
      () => 'Tente de novo.',
    )
    if (falhou) {
      escondidos = escondidos.filter((c) => c !== chave)
      const erroId = mostrar({ texto: `Não apaguei ${nome}. ${falhou}`, erro: true })
      setTimeout(() => tirarAviso(erroId), ESPERA_MS)
    }
    emitir()
  }, ESPERA_MS)
  const id = mostrar({
    texto: `${nome} apagado.`,
    desfazer: () => {
      clearTimeout(espera)
      escondidos = escondidos.filter((c) => c !== chave)
      tirarAviso(id)
    },
  })
}

/** Item de lista que some enquanto espera para ser apagado. */
export function Apagavel({ chave, children, className }: { chave: string; children: ReactNode; className?: string }) {
  const somem = useSyncExternalStore(assinar, () => escondidos, () => escondidos)
  return somem.includes(chave) ? null : <li className={className}>{children}</li>
}

/** Linha de tabela que some do mesmo jeito. */
export function ApagavelLinha({ chave, children }: { chave: string; children: ReactNode }) {
  const somem = useSyncExternalStore(assinar, () => escondidos, () => escondidos)
  return somem.includes(chave) ? null : <tr>{children}</tr>
}

export function BotaoApagar({
  chave,
  nome,
  acao,
  local,
  bloqueio,
  voltarPara,
  className = 'sair',
  rotulo = 'Apagar',
}: {
  chave: string
  /** Como o item é chamado nas mensagens, ex.: o nome do produto. */
  nome: string
  /** Ação do servidor que apaga; roda quando o aviso acaba. */
  acao?: () => Promise<Estado | void>
  /** Para dados que só existem na tela: some na hora e volta com Desfazer. */
  local?: { apagar: () => void; restaurar: () => void }
  /** Se houver, o item não pode ser apagado: mostra este motivo no lugar da pergunta. */
  bloqueio?: string
  /** Tela para onde ir logo depois de confirmar (a do próprio item deixa de existir). */
  voltarPara?: string
  className?: string
  rotulo?: string
}) {
  const router = useRouter()
  const caixa = useRef<HTMLDialogElement>(null)

  function confirmar() {
    caixa.current?.close()
    if (local) {
      local.apagar()
      const id = mostrar({
        texto: `${nome} apagado.`,
        desfazer: () => {
          local.restaurar()
          tirarAviso(id)
        },
      })
      setTimeout(() => tirarAviso(id), ESPERA_MS)
    } else if (acao) {
      adiar(chave, nome, async () => {
        const r = await acao()
        if (!r || !r.erro) router.refresh()
        return r
      })
    }
    if (voltarPara) router.push(voltarPara)
  }

  return (
    <>
      <button type="button" className={className} aria-label={`${rotulo} ${nome}`} onClick={() => caixa.current?.showModal()}>
        {rotulo}
      </button>
      <dialog ref={caixa} className="dialogo" aria-labelledby={`${chave}-titulo`}>
        <p id={`${chave}-titulo`}>{bloqueio ?? `Tem certeza que quer apagar ${nome}?`}</p>
        <div className="pedido__acoes">
          {!bloqueio && (
            <button type="button" className="botao perigo" onClick={confirmar}>
              Apagar
            </button>
          )}
          <button type="button" className="botao secundario" autoFocus onClick={() => caixa.current?.close()}>
            {bloqueio ? 'Entendi' : 'Cancelar'}
          </button>
        </div>
      </dialog>
    </>
  )
}

/** Os avisos "apagado · Desfazer", fixos embaixo da tela. Fica uma vez só, no layout do painel. */
export function AvisosDeApagar() {
  const lista = useSyncExternalStore(assinar, () => avisos, () => avisos)
  if (!lista.length) return null
  return (
    <div className="avisos">
      {lista.map((a) => (
        <div key={a.id} className={a.erro ? 'aviso aviso--erro' : 'aviso'} role={a.erro ? 'alert' : 'status'}>
          <span>{a.texto}</span>
          {a.desfazer && (
            <button type="button" className="aviso__desfazer" onClick={a.desfazer}>
              Desfazer
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
