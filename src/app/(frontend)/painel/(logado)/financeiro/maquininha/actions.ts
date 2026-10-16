'use server'

/**
 * Conferir a maquininha por foto: a leitura pelo Google (Gemini, camada gratuita) e o total em cartão
 * de um dia. A foto vai só para o Google e para a resposta; nada é guardado aqui.
 */
import { intervaloDoDia } from '@/lib/entregadores'
import {
  ESQUEMA_GEMINI,
  type LeituraFoto,
  lerRespostaGemini,
  PEDIDO_GEMINI,
} from '@/lib/fotoMaquininha'
import { chamarGemini } from '@/lib/gemini'
import { sessao } from '@/lib/painel'

export type ResultadoFoto =
  | { ok: true; leitura: LeituraFoto }
  /** `foto`: a foto não serve, peça outra. `indisponivel`: o Google não leu (sem chave, cota, rede); corrigir à mão ou usar o CSV. */
  | { ok: false; tipo: 'foto' | 'indisponivel'; motivo: string }

const MAX_FOTOS = 4
const MAX_BYTES = 3_500_000

export async function lerFotoNoGoogle(imagens: string[]): Promise<ResultadoFoto> {
  await sessao('financeiro')
  const fotos = (Array.isArray(imagens) ? imagens : []).filter((i): i is string => typeof i === 'string').slice(0, MAX_FOTOS)
  const dados = fotos.map((i) => i.match(/^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/)?.[1])
  if (!fotos.length || dados.some((d) => !d) || fotos.reduce((s, f) => s + f.length, 0) > MAX_BYTES) {
    return { ok: false, tipo: 'foto', motivo: 'A foto não pôde ser enviada (tamanho ou formato). Tire de novo.' }
  }
  const r = await chamarGemini(
    [{ type: 'text', text: PEDIDO_GEMINI }, ...dados.map((data) => ({ type: 'image', data, mime_type: 'image/jpeg' }))],
    ESQUEMA_GEMINI,
  )
  if (!r.ok) {
    const motivo = {
      cota: 'A cota gratuita do Google acabou por agora. Corrija os valores à mão, tente mais tarde ou envie o arquivo da maquininha.',
      falhou: 'O Google não conseguiu ler agora. Corrija os valores à mão ou envie o arquivo da maquininha.',
      rede: 'O Google não respondeu. Corrija os valores à mão ou envie o arquivo da maquininha.',
      'sem-chave': 'A leitura pelo Google não está ligada. Corrija os valores à mão ou envie o arquivo da maquininha.',
    }[r.erro]
    return { ok: false, tipo: 'indisponivel', motivo }
  }
  const lido = lerRespostaGemini(r.json)
  return lido.ok ? { ok: true, leitura: lido.leitura } : { ok: false, tipo: 'foto', motivo: lido.motivo }
}

/** Quanto a loja vendeu em cartão num dia (pedidos entregues e contas de mesa), para comparar com os totais do relatório. */
export async function totalCartaoDoDia(dia: string): Promise<number> {
  const { payload, loja, comoUsuario } = await sessao('financeiro')
  const { de, ate } = intervaloDoDia(dia)
  const busca = { limit: 0, depth: 0, ...comoUsuario } as const
  const [pedidos, fechamentos] = await Promise.all([
    payload.find({
      collection: 'pedidos',
      where: { loja: { equals: loja.id }, status: { equals: 'entregue' }, pagamento: { equals: 'cartao' }, mesa: { exists: false }, createdAt: { greater_than_equal: de, less_than: ate } },
      ...busca,
    }),
    payload.find({
      collection: 'fechamentos',
      where: { loja: { equals: loja.id }, createdAt: { greater_than_equal: de, less_than: ate } },
      ...busca,
    }),
  ])
  const c = (v: number) => Math.round(v * 100)
  return (
    (pedidos.docs.reduce((s, p) => s + c(p.total), 0) +
      fechamentos.docs.reduce((s, f) => s + (f.pagamentos ?? []).filter((x) => x.forma === 'cartao').reduce((t, x) => t + c(x.valor), 0), 0)) /
    100
  )
}
