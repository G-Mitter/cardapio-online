'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

import { reservarImpressao } from '@/app/(frontend)/painel/actions'
import { rotuloAgendamento } from '@/lib/agendamento'
import { brl, rotuloPagamento } from '@/lib/pedido'
import { rotuloTipo } from '@/lib/pedidosDoDia'
import { type ItemTicket, type Largura, montarTickets } from '@/lib/ticket'

export type PedidoImpressao = {
  id: number
  numero: number
  createdAt: string
  nome: string
  telefone: string
  modo: 'entrega' | 'retirada'
  balcao: boolean
  mesa: string
  garcom: string
  endereco: string
  agendadoPara: string | null
  observacoes: string
  pagamento: string
  trocoPara: number | null
  taxa: number
  total: number
  /** Ainda não saiu na impressora e a regra da loja manda imprimir. */
  pendente: boolean
  itens: ItemTicket[]
}

const ATUALIZA_MS = 5_000
const hora = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })

const TESTE: PedidoImpressao = {
  id: 0,
  numero: 0,
  createdAt: new Date().toISOString(),
  nome: 'Teste de impressão',
  telefone: '',
  modo: 'retirada',
  balcao: false,
  mesa: '',
  garcom: '',
  endereco: '',
  agendadoPara: null,
  observacoes: 'Se este ticket saiu inteiro, está tudo certo.',
  pagamento: 'pix',
  trocoPara: null,
  taxa: 0,
  total: 10,
  pendente: false,
  itens: [{ nome: 'Item de teste', quantidade: 1, opcoes: '', precoUnitario: 10, setor: 'Cozinha', embalagem: '' }],
}

/** O ticket em si: texto simples, em fonte monoespaçada, que sai bem em papel térmico. */
function Ticket({ loja, p, setor, itens, completo }: { loja: string; p: PedidoImpressao; setor: string | null; itens: ItemTicket[]; completo: boolean }) {
  return (
    <section className="ticket">
      <h3>{loja}</h3>
      {setor && <h2>{setor.toUpperCase()}</h2>}
      <p>
        <b>Pedido Nº {p.numero}</b> · {hora(p.createdAt)}
      </p>
      <p>{rotuloTipo(p.modo, p.balcao, p.mesa, p.garcom)}</p>
      {p.agendadoPara && <p>Agendado para {rotuloAgendamento(p.agendadoPara)}</p>}
      <p>
        {p.nome}
        {completo && p.telefone && ` · ${p.telefone}`}
      </p>
      {completo && p.endereco && p.modo === 'entrega' && <p>{p.endereco}</p>}
      <hr />
      <ul>
        {itens.map((i, n) => (
          <li key={n}>
            <b>{i.quantidade}x</b> {i.nome}
            {completo && <span className="ticket__valor">{brl(i.quantidade * i.precoUnitario)}</span>}
            {i.opcoes && <small>{i.opcoes}</small>}
            {i.embalagem && <small>Embalagem: {i.embalagem}</small>}
          </li>
        ))}
      </ul>
      {p.observacoes && (
        <>
          <hr />
          <p>
            <b>Obs.:</b> {p.observacoes}
          </p>
        </>
      )}
      {completo && (
        <>
          <hr />
          {p.taxa > 0 && <p>Entrega: {brl(p.taxa)}</p>}
          <p>
            <b>Total: {brl(p.total)}</b>
          </p>
          {p.pagamento && (
            <p>
              Pagamento: {rotuloPagamento(p.pagamento)}
              {p.trocoPara ? ` · troco para ${brl(p.trocoPara)}` : ''}
            </p>
          )}
        </>
      )}
    </section>
  )
}

/**
 * Impressão automática: a cada pedido novo (a tela confere a cada 5 segundos) o ticket é montado e a impressão
 * é disparada. Para sair sem janela de confirmação, abra esta tela no Chrome iniciado com `--kiosk-printing`.
 */
export function Impressao({ loja, setores, pedidos }: { loja: { nome: string; ligada: boolean; largura: Largura; vias: number }; setores: string[]; pedidos: PedidoImpressao[] }) {
  const router = useRouter()
  const [atual, setAtual] = useState<PedidoImpressao | null>(null)
  const tentados = useRef<Set<number>>(new Set())
  const ocupado = useRef(false)
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    const t = setInterval(() => document.visibilityState === 'visible' && router.refresh(), ATUALIZA_MS)
    return () => clearInterval(t)
  }, [router])

  /** Monta o ticket na página (escondido na tela, visível só ao imprimir) e manda para a impressora. */
  function imprimir(p: PedidoImpressao) {
    flushSync(() => setAtual(p))
    window.print()
    setAtual(null)
  }

  useEffect(() => {
    if (!loja.ligada || ocupado.current) return
    // O mais antigo da fila primeiro: a lista vem do mais novo para o mais antigo.
    const p = [...pedidos].reverse().find((x) => x.pendente && !tentados.current.has(x.id))
    if (!p) return
    tentados.current.add(p.id)
    ocupado.current = true
    ;(async () => {
      try {
        if (await reservarImpressao(p.id)) imprimir(p)
      } catch {
        setAviso(`Não consegui imprimir o pedido Nº ${p.numero}. Use Reimprimir.`)
      } finally {
        ocupado.current = false
        router.refresh()
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidos, loja.ligada])

  const tickets = atual ? montarTickets(atual.itens, setores).flatMap((t) => Array.from({ length: loja.vias }, () => t)) : []

  return (
    <div className="impressao">
      <style>{`@media print { @page { size: ${loja.largura}mm auto; margin: 0 } }`}</style>
      <p className={loja.ligada ? undefined : 'erro'}>
        {loja.ligada
          ? 'Impressão automática ligada. Deixe esta tela aberta neste computador; cada pedido novo sai na impressora.'
          : 'A impressão automática está desligada. Ligue em Configurar, aqui embaixo.'}
      </p>
      <p>
        <small>
          Para imprimir sem janela de confirmação, abra o Chrome com <code>--kiosk-printing</code> (no atalho do Chrome, em Destino, depois de chrome.exe) e escolha a impressora térmica como padrão do computador.
        </small>
      </p>
      {aviso && <p role="alert" className="erro">{aviso}</p>}
      <p>
        <button type="button" className="botao secundario" onClick={() => imprimir(TESTE)}>
          Imprimir teste
        </button>
      </p>

      <h2>Últimos pedidos</h2>
      {!pedidos.length && <p className="vazio">Nenhum pedido nas últimas 12 horas.</p>}
      <ul className="lista">
        {pedidos.slice(0, 15).map((p) => (
          <li key={p.id}>
            <div className="lista__nome">
              <b>Nº {p.numero} · {p.nome}</b>
              <span>
                {hora(p.createdAt)} · {rotuloTipo(p.modo, p.balcao, p.mesa, p.garcom)} · {p.pendente ? 'Na fila para imprimir' : 'Já impresso ou fora da regra'}
              </span>
            </div>
            <button type="button" className="botao secundario" onClick={() => imprimir(p)}>
              Reimprimir
            </button>
          </li>
        ))}
      </ul>

      <div className={`ticket-area ticket--${loja.largura}`} aria-hidden>
        {atual && tickets.map((t, n) => <Ticket key={n} loja={loja.nome} p={atual} setor={t.setor} itens={t.itens} completo={t.completo} />)}
      </div>
    </div>
  )
}
