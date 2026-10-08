/**
 * Conferir a maquininha por foto, sem banco e sem tela: dá para testar sozinho.
 * A foto é lida primeiro no próprio celular (OCR) e, se não der, pelo Google (Gemini, camada gratuita).
 * Aqui ficam: a conferência da qualidade da foto, a leitura do texto do OCR, a leitura da resposta do
 * Gemini, a prova dos nove (a soma das vendas tem de bater com o total impresso) e a conversão para o
 * CSV que "Conferir a maquininha" já entende.
 */
import { lerPreco } from './planilha'

export type VendaFoto = { dia: string; hora: string; valor: number; tipo: 'débito' | 'crédito'; bandeira: string }

export type LeituraFoto = {
  vendas: VendaFoto[]
  /** Total geral impresso no relatório, se a foto mostra. */
  totalImpresso: number | null
  totalDebito: number | null
  totalCredito: number | null
  /** AAAA-MM-DD do relatório, quando o texto traz uma data só. */
  dia: string | null
}

const centavos = (v: number) => Math.round(v * 100)

// ---------- Qualidade da foto (feita no celular, antes de enviar) ----------

export type MedidasFoto = { largura: number; altura: number; brilho: number; nitidez: number }

/** Menor lado, em pixels, abaixo do qual o texto do papel térmico não sai legível. */
export const MIN_LADO = 700
/** ponytail: limites ajustados no olho; calibrar com fotos reais de papel de maquininha do piloto. */
export const BRILHO_MIN = 70
export const BRILHO_MAX = 235
export const NITIDEZ_MIN = 40

/**
 * Brilho médio (0 a 255) e nitidez (variância do laplaciano; foto tremida dá valor baixo) de uma imagem
 * em tons de cinza. A imagem deve vir reduzida (uns 1000 px de largura) para a nitidez ser comparável.
 */
export function medirImagem(cinza: ArrayLike<number>, largura: number, altura: number): Pick<MedidasFoto, 'brilho' | 'nitidez'> {
  let soma = 0
  for (let i = 0; i < cinza.length; i++) soma += cinza[i]
  const lap: number[] = []
  for (let y = 1; y < altura - 1; y++) {
    for (let x = 1; x < largura - 1; x++) {
      const i = y * largura + x
      lap.push(4 * cinza[i] - cinza[i - 1] - cinza[i + 1] - cinza[i - largura] - cinza[i + largura])
    }
  }
  const media = lap.reduce((s, v) => s + v, 0) / (lap.length || 1)
  const nitidez = lap.reduce((s, v) => s + (v - media) ** 2, 0) / (lap.length || 1)
  return { brilho: soma / (cinza.length || 1), nitidez }
}

export function avaliarFoto(m: MedidasFoto): { ok: true } | { ok: false; motivo: string } {
  if (Math.min(m.largura, m.altura) < MIN_LADO) return { ok: false, motivo: 'A foto ficou pequena demais. Chegue mais perto do papel e tire de novo.' }
  if (m.brilho < BRILHO_MIN) return { ok: false, motivo: 'A foto ficou escura. Tire de novo num lugar com mais luz.' }
  if (m.brilho > BRILHO_MAX) return { ok: false, motivo: 'A foto ficou clara demais (reflexo ou flash). Tire de novo sem flash e sem luz batendo direto no papel.' }
  if (m.nitidez < NITIDEZ_MIN) return { ok: false, motivo: 'A foto ficou tremida ou sem foco. Apoie o celular, espere focar e tire de novo.' }
  return { ok: true }
}

// ---------- Leitura do texto do OCR ----------

const VALOR = /(?:R\$\s*)?(\d{1,3}(?:\.\d{3})+|\d+)[,.](\d{2})(?!\d)/g

const valoresDe = (linha: string) => [...linha.matchAll(VALOR)].map((m) => lerPreco(`${m[1].replace(/\./g, '')},${m[2]}`)).filter((v): v is number => v !== null)

function dataDe(texto: string): string | null {
  const m = texto.match(/\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{4}|\d{2})\b/)
  if (!m) return null
  const ano = m[3].length === 2 ? `20${m[3]}` : m[3]
  const dia = `${ano}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
  const d = new Date(`${dia}T00:00:00Z`)
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== dia ? null : dia
}

const ehDebito = (t: string) => /d[eéê]b/i.test(t)
const ehCredito = (t: string) => /cr[eéê]d|parcel/i.test(t)
const BANDEIRAS = /\b(visa|master(?:card)?|elo|amex|hiper(?:card)?|maestro)\b/i

/**
 * Texto que o OCR leu do relatório → vendas e totais. Cada linha com horário e valor é uma venda;
 * a data vem da própria linha ou da última data vista acima. Linha com "total" é total (do débito, do
 * crédito ou geral). Vendas em Pix ficam de fora, como no CSV. Erra para o lado de deixar a loja corrigir.
 */
export function lerTextoOcr(texto: string): LeituraFoto {
  const vendas: VendaFoto[] = []
  let totalImpresso: number | null = null
  let totalDebito: number | null = null
  let totalCredito: number | null = null
  let diaAtual: string | null = null
  const dias = new Set<string>()
  for (const linha of texto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)) {
    const d = dataDe(linha)
    if (d) {
      diaAtual = d
      dias.add(d)
    }
    const valores = valoresDe(linha)
    if (!valores.length) continue
    if (/total/i.test(linha) && !/\d{1,2}:\d{2}/.test(linha)) {
      const v = valores[valores.length - 1]
      if (ehDebito(linha)) totalDebito = v
      else if (ehCredito(linha)) totalCredito = v
      else totalImpresso = Math.max(totalImpresso ?? 0, v)
      continue
    }
    const h = linha.match(/\b(\d{1,2})[:h](\d{2})\b/)
    if (!h || Number(h[1]) > 23 || Number(h[2]) > 59 || /pix/i.test(linha)) continue
    vendas.push({
      dia: d ?? diaAtual ?? '',
      hora: `${h[1].padStart(2, '0')}:${h[2]}`,
      valor: valores[0],
      tipo: ehDebito(linha) && !ehCredito(linha) ? 'débito' : 'crédito',
      bandeira: linha.match(BANDEIRAS)?.[1] ?? '',
    })
  }
  return { vendas, totalImpresso, totalDebito, totalCredito, dia: dias.size === 1 ? [...dias][0] : null }
}

/** Junta as leituras de várias fotos do mesmo relatório: venda repetida entre fotos conta uma vez só. */
export function juntarLeituras(leituras: LeituraFoto[]): LeituraFoto {
  // ponytail: duas vendas idênticas no mesmo minuto (mesmo valor e tipo) viram uma; a loja soma de volta na tabela.
  const vistas = new Set<string>()
  const vendas = leituras.flatMap((l) => l.vendas).filter((v) => {
    const k = `${v.dia}|${v.hora}|${centavos(v.valor)}|${v.tipo}`
    return vistas.has(k) ? false : (vistas.add(k), true)
  })
  const ultimo = <K extends 'totalImpresso' | 'totalDebito' | 'totalCredito' | 'dia'>(k: K) => leituras.map((l) => l[k]).filter((x) => x !== null).at(-1) ?? null
  return { vendas, totalImpresso: ultimo('totalImpresso'), totalDebito: ultimo('totalDebito'), totalCredito: ultimo('totalCredito'), dia: ultimo('dia') }
}

/** A prova dos nove: a soma das vendas lidas bate com o total impresso (quando a foto mostra um)? */
export function conferirSoma(l: Pick<LeituraFoto, 'vendas' | 'totalImpresso'>): { ok: true } | { ok: false; motivo: string } {
  if (!l.vendas.length) return { ok: false, motivo: 'Não achei vendas na foto.' }
  if (l.totalImpresso === null) return { ok: true }
  const soma = l.vendas.reduce((s, v) => s + centavos(v.valor), 0)
  if (soma === centavos(l.totalImpresso)) return { ok: true }
  const f = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  return { ok: false, motivo: `A soma das vendas lidas (${f(soma)}) não bate com o total do relatório (${f(centavos(l.totalImpresso))}). Pode faltar parte do papel ou ter número lido errado.` }
}

/** Vendas da tabela (já corrigidas pela loja) no CSV que o conferidor lê. */
export function vendasParaCsv(vendas: VendaFoto[]): string {
  const dm = (d: string) => d.split('-').reverse().join('/')
  const virg = (v: number) => v.toFixed(2).replace('.', ',')
  return (
    'Data da venda;Hora;Tipo;Bandeira;Valor bruto\n' +
    vendas.map((v) => [dm(v.dia), v.hora, v.tipo === 'débito' ? 'Débito' : 'Crédito', v.bandeira, virg(v.valor)].join(';')).join('\n') +
    '\n'
  )
}

// ---------- Resposta do Gemini ----------

/** O que pedimos ao Gemini, em JSON Schema (response_format da API Interactions). */
export const ESQUEMA_GEMINI = {
  type: 'object',
  properties: {
    foto_boa: { type: 'boolean', description: 'false se a foto está cortada, tremida, escura ou com reflexo a ponto de não dar para ler com segurança.' },
    motivo: { type: 'string', description: 'Se foto_boa é false, o que está errado, em português e em uma frase curta.' },
    data_relatorio: { type: 'string', description: 'AAAA-MM-DD, se o relatório é de um dia só.' },
    vendas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          data: { type: 'string', description: 'AAAA-MM-DD' },
          hora: { type: 'string', description: 'HH:MM' },
          valor: { type: 'number', description: 'Valor bruto da venda em reais.' },
          tipo: { type: 'string', enum: ['débito', 'crédito', 'pix'] },
          bandeira: { type: 'string' },
        },
        required: ['data', 'hora', 'valor', 'tipo'],
      },
    },
    total_impresso: { type: 'number', description: 'Total geral impresso, se houver.' },
    total_debito: { type: 'number' },
    total_credito: { type: 'number' },
  },
  required: ['foto_boa', 'vendas'],
} as const

export const PEDIDO_GEMINI =
  'Estas são fotos do relatório de vendas do dia impresso por uma maquininha de cartão (a mesma ordem do papel). ' +
  'Liste cada venda com data (AAAA-MM-DD), hora (HH:MM), valor bruto, tipo (débito, crédito ou pix) e bandeira. ' +
  'Informe também os totais impressos (geral, débito e crédito), se houver. Não leia nem repita números de cartão. ' +
  'Nunca invente valores: se uma parte estiver cortada, tremida, escura ou com reflexo a ponto de não ter certeza, ' +
  'marque foto_boa como false e explique o que está errado em uma frase curta em português. Responda só o JSON.'

/** Texto da resposta da API Interactions (campo `output_text`, ou o texto do passo `model_output`). */
export function textoDaResposta(r: unknown): string | null {
  const o = r as { output_text?: unknown; steps?: { type?: string; content?: { text?: string }[] }[] } | null
  if (typeof o?.output_text === 'string') return o.output_text
  const passo = o?.steps?.filter((s) => s.type === 'model_output').at(-1)
  const t = passo?.content?.map((c) => c.text ?? '').join('')
  return t || null
}

/** JSON do Gemini → leitura. Valores fora do esperado são descartados; Pix fica de fora. */
export function lerRespostaGemini(json: unknown): { ok: true; leitura: LeituraFoto } | { ok: false; motivo: string } {
  const o = json as Record<string, unknown> | null
  if (!o || typeof o !== 'object') return { ok: false, motivo: 'A leitura do Google veio em branco.' }
  if (o.foto_boa === false) return { ok: false, motivo: typeof o.motivo === 'string' && o.motivo ? o.motivo : 'A foto não ficou boa. Tire de novo.' }
  const num = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) && x >= 0 ? x : null)
  const vendas: VendaFoto[] = []
  for (const v of Array.isArray(o.vendas) ? (o.vendas as Record<string, unknown>[]) : []) {
    const valor = num(v.valor)
    const hora = typeof v.hora === 'string' ? v.hora.match(/^(\d{1,2}):(\d{2})/) : null
    const dia = typeof v.data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v.data) ? v.data : ''
    if (valor === null || valor <= 0 || !hora || v.tipo === 'pix') continue
    vendas.push({ dia, hora: `${hora[1].padStart(2, '0')}:${hora[2]}`, valor, tipo: v.tipo === 'débito' ? 'débito' : 'crédito', bandeira: typeof v.bandeira === 'string' ? v.bandeira.slice(0, 20) : '' })
  }
  return {
    ok: true,
    leitura: {
      vendas,
      totalImpresso: num(o.total_impresso),
      totalDebito: num(o.total_debito),
      totalCredito: num(o.total_credito),
      dia: typeof o.data_relatorio === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.data_relatorio) ? o.data_relatorio : null,
    },
  }
}
