/**
 * Conferência do relatório da maquininha com os pedidos pagos em cartão, sem banco e sem tela:
 * dá para testar sozinha. Valores em reais na entrada; comparados em centavos.
 *
 * Cada maquininha chama as colunas de um jeito, então reconhecemos os títulos mais comuns
 * (sem acento e sem diferença de maiúsculas) em vez de ter um leitor por marca.
 */
import { lerCsv, lerPreco, normalizar } from './planilha'

export type Venda = {
  linha: number
  dia: string // AAAA-MM-DD
  /** Momento da venda (ms); null se o relatório só traz a data. */
  quando: number | null
  valor: number
  tipo: 'débito' | 'crédito'
  bandeira: string
  taxa: number
  liquido: number
  /** Data prevista de pagamento (AAAA-MM-DD), se o relatório traz. */
  previsao: string | null
}

export type LeituraRelatorio = {
  vendas: Venda[]
  erros: { linha: number; motivo: string }[]
  /** Vendas em Pix na maquininha: não entram na conferência de cartão. */
  ignoradas: number
  temTaxa: boolean
}

const COLUNAS = {
  data: ['data', 'data da venda', 'data/hora', 'data e hora', 'data hora', 'data da transacao', 'data venda', 'data da captura'],
  hora: ['hora', 'horario', 'hora da venda', 'hora da transacao'],
  valor: ['valor', 'valor bruto', 'valor da venda', 'valor da transacao', 'valor original', 'valor total'],
  tipo: ['tipo', 'modalidade', 'forma de pagamento', 'tipo de pagamento', 'meio de pagamento', 'produto', 'tipo de transacao'],
  bandeira: ['bandeira'],
  taxa: ['taxa', 'valor da taxa', 'valor taxa', 'mdr', 'valor mdr', 'desconto', 'tarifa', 'taxa (r$)', 'taxa %', 'taxa (%)'],
  liquido: ['valor liquido', 'liquido', 'valor a receber', 'valor liquidado', 'valor liquido da venda'],
  previsao: ['previsao de pagamento', 'previsao', 'data prevista', 'data prevista de pagamento', 'data de pagamento', 'data de recebimento', 'previsto para'],
} as const

function acharColuna(cab: string[], nomes: readonly string[]) {
  return cab.findIndex((h) => nomes.includes(h))
}

/** "08/10/2026", "08/10/2026 14:35[:12]", "2026-10-08 14:35", "2026-10-08T14:35:00" → dia e hora (se tiver). */
export function lerDataHora(t: string): { dia: string; hora: string | null } | null {
  const s = t.trim()
  let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T]+(\d{1,2}):(\d{2}))?/)
  let dia: string, hora: string | null
  if (m) {
    dia = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
    hora = m[4] ? `${m[4].padStart(2, '0')}:${m[5]}` : null
  } else if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T]+(\d{1,2}):(\d{2}))?/))) {
    dia = `${m[1]}-${m[2]}-${m[3]}`
    hora = m[4] ? `${m[4].padStart(2, '0')}:${m[5]}` : null
  } else return null
  const d = new Date(`${dia}T00:00:00Z`)
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== dia ? null : { dia, hora }
}

const centavos = (v: number) => Math.round(v * 100)

export function lerRelatorio(texto: string): LeituraRelatorio {
  const linhas = lerCsv(texto)
  const cab = (linhas[0] ?? []).map(normalizar)
  const col = Object.fromEntries(Object.entries(COLUNAS).map(([k, v]) => [k, acharColuna(cab, v)])) as Record<
    keyof typeof COLUNAS,
    number
  >
  const vazio = { vendas: [], ignoradas: 0, temTaxa: false }
  if (col.data < 0 || col.valor < 0) {
    return {
      ...vazio,
      erros: [{ linha: 1, motivo: 'Não achei as colunas de data e de valor. Confira se a primeira linha tem os títulos do relatório.' }],
    }
  }

  const vendas: Venda[] = []
  const erros: LeituraRelatorio['erros'] = []
  let ignoradas = 0
  for (const [i, l] of linhas.slice(1).entries()) {
    const linha = i + 2
    const cel = (k: keyof typeof COLUNAS) => (col[k] >= 0 ? (l[col[k]] ?? '').trim() : '')
    const tipoTexto = normalizar(cel('tipo'))
    if (tipoTexto.includes('pix')) {
      ignoradas++
      continue
    }
    const dh = lerDataHora(cel('data'))
    const hora = dh?.hora ?? cel('hora').match(/^(\d{1,2}):(\d{2})/)?.slice(1, 3).map((x) => x.padStart(2, '0')).join(':') ?? null
    const valor = lerPreco(cel('valor'))
    if (!dh) {
      erros.push({ linha, motivo: 'Data não reconhecida. Use dia/mês/ano ou ano-mês-dia.' })
      continue
    }
    if (valor === null || valor <= 0) {
      erros.push({ linha, motivo: 'Valor inválido.' })
      continue
    }
    // Sem a palavra "débito" tratamos como crédito (inclui "parcelado").
    const tipo = tipoTexto.includes('deb') ? 'débito' : 'crédito'

    const taxaTexto = cel('taxa')
    const liquidoLido = cel('liquido') ? lerPreco(cel('liquido')) : null
    let taxa = 0
    if (taxaTexto.includes('%')) taxa = Math.round(valor * (lerPreco(taxaTexto.replace('%', '')) ?? 0)) / 100
    else if (taxaTexto) taxa = lerPreco(taxaTexto) ?? 0
    else if (liquidoLido !== null) taxa = (centavos(valor) - centavos(liquidoLido)) / 100
    const liquido = liquidoLido ?? (centavos(valor) - centavos(taxa)) / 100

    vendas.push({
      linha,
      dia: dh.dia,
      quando: hora ? new Date(`${dh.dia}T${hora}:00-03:00`).getTime() : null,
      valor,
      tipo,
      bandeira: cel('bandeira'),
      taxa,
      liquido,
      previsao: lerDataHora(cel('previsao'))?.dia ?? null,
    })
  }
  return { vendas, erros, ignoradas, temTaxa: col.taxa >= 0 || col.liquido >= 0 }
}

/** Pagamento em cartão do lado da loja: de `de` até `ate` (ms) a maquininha pode ter passado. */
export type PagamentoLoja = { id: string; rotulo: string; valor: number; de: number; ate: number }

export const TOLERANCIA_MIN = 20

/**
 * Casa cada venda da maquininha com um pagamento da loja de mesmo valor e horário próximo
 * (até `tolerancia` min antes do pedido ser feito ou depois de finalizado). Sem hora no relatório,
 * vale o mesmo dia. Pega o mais próximo; cada pagamento casa uma vez só.
 */
export function conferir(vendas: Venda[], pagamentos: PagamentoLoja[], tolerancia = TOLERANCIA_MIN) {
  const livres = [...pagamentos]
  const confere: { venda: Venda; pagamento: PagamentoLoja }[] = []
  const soNaMaquininha: Venda[] = []
  const folga = tolerancia * 60_000
  const dia = (ms: number) => new Date(ms - 3 * 3_600_000).toISOString().slice(0, 10)

  for (const venda of [...vendas].sort((a, b) => (a.quando ?? 0) - (b.quando ?? 0))) {
    let melhor = -1
    let menor = Infinity
    for (const [i, p] of livres.entries()) {
      if (centavos(p.valor) !== centavos(venda.valor)) continue
      let dist: number
      if (venda.quando === null) dist = dia(p.de) === venda.dia || dia(p.ate) === venda.dia ? 0 : Infinity
      else dist = Math.max(p.de - venda.quando, venda.quando - p.ate, 0)
      if (dist <= (venda.quando === null ? 0 : folga) && dist < menor) {
        melhor = i
        menor = dist
      }
    }
    if (melhor < 0) soNaMaquininha.push(venda)
    else confere.push({ venda, pagamento: livres.splice(melhor, 1)[0] })
  }

  const soma = (xs: number[]) => xs.reduce((s, x) => s + centavos(x), 0) / 100
  const vendido = soma(vendas.map((v) => v.valor))
  const taxa = soma(vendas.map((v) => v.taxa))
  return {
    confere,
    soNaMaquininha,
    soNoPedido: livres,
    totais: {
      vendido,
      recebido: soma(vendas.map((v) => v.liquido)),
      taxa,
      taxaEfetiva: vendido ? Math.round((taxa / vendido) * 10_000) / 100 : 0,
      pedidos: soma(pagamentos.map((p) => p.valor)),
    },
  }
}

/** O que a maquininha vai pagar em cada data prevista (líquido), para lançar em "A receber". */
export function recebimentosPorData(vendas: Venda[]) {
  const porData = new Map<string, number>()
  for (const v of vendas) if (v.previsao) porData.set(v.previsao, (porData.get(v.previsao) ?? 0) + centavos(v.liquido))
  return [...porData].sort().map(([data, c]) => ({ data, valor: c / 100 }))
}

/** Exemplos para o botão "Colar exemplo": os títulos variam de uma maquininha para outra. */
export const MAQUININHAS = [
  {
    nome: 'Stone',
    exemplo:
      'Data da venda;Hora;Tipo;Bandeira;Valor bruto;Valor líquido;Previsão de pagamento\n' +
      '08/10/2026;12:41;Débito;Visa;58,90;57,76;09/10/2026\n' +
      '08/10/2026;13:05;Crédito;Mastercard;92,00;89,15;07/11/2026\n',
  },
  {
    nome: 'PagBank',
    exemplo:
      'Data/Hora;Modalidade;Bandeira;Valor da venda;Taxa (R$);Valor líquido;Data prevista\n' +
      '08/10/2026 12:41;Débito;Visa;58,90;1,14;57,76;09/10/2026\n' +
      '08/10/2026 13:05;Crédito à vista;Mastercard;92,00;2,85;89,15;07/11/2026\n',
  },
  {
    nome: 'Mercado Pago',
    exemplo:
      'Data da transação;Meio de pagamento;Bandeira;Valor;Taxa;Valor a receber;Data de recebimento\n' +
      '2026-10-08 12:41:10;Cartão de débito;Visa;58.90;1.14;57.76;2026-10-09\n' +
      '2026-10-08 13:05:33;Cartão de crédito;Mastercard;92.00;2.85;89.15;2026-11-07\n',
  },
  {
    nome: 'Cielo',
    exemplo:
      'Data da venda;Hora da venda;Forma de pagamento;Bandeira;Valor bruto;MDR;Valor líquido;Previsão\n' +
      '08/10/2026;12:41;Débito;Visa;58,90;1,14;57,76;09/10/2026\n' +
      '08/10/2026;13:05;Crédito;Mastercard;92,00;2,85;89,15;07/11/2026\n',
  },
  {
    nome: 'InfinitePay',
    exemplo:
      'Data;Horário;Tipo de pagamento;Bandeira;Valor;Taxa %;Valor líquido\n' +
      '08/10/2026;12:41;Débito;Visa;58,90;1,94%;57,76\n' +
      '08/10/2026;13:05;Crédito;Mastercard;92,00;3,10%;89,15\n',
  },
] as const
