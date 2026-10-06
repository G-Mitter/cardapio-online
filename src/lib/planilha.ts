/**
 * Importação de produtos por planilha, sem banco e sem tela: dá para testar sozinha.
 *
 * A planilha precisa de uma linha de cabeçalho com as colunas nome, preço e
 * categoria (descrição e esgotado são opcionais), em qualquer ordem e com ou
 * sem acento. Cada linha seguinte vira um produto.
 */

export type LinhaProduto = {
  linha: number
  nome: string
  descricao: string
  preco: number
  categoria: string
  esgotado: boolean
}

export type ErroLinha = { linha: number; motivo: string }

export type Leitura = { produtos: LinhaProduto[]; erros: ErroLinha[] }

export const MAX_LINHAS = 1000

/** "Preço" → "preco", " Descrição " → "descricao". */
export const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()

/**
 * Lê CSV. O Excel em português salva com ponto e vírgula; em inglês, com vírgula.
 * Usamos o separador que aparece mais na primeira linha. Aspas protegem
 * separadores e quebras de linha dentro do texto ("Arroz, feijão").
 */
export function lerCsv(texto: string): string[][] {
  const t = texto.replace(/^﻿/, '')
  const primeira = t.split(/\r?\n/, 1)[0] ?? ''
  const sep = (primeira.match(/;/g)?.length ?? 0) > (primeira.match(/,/g)?.length ?? 0) ? ';' : ','

  const linhas: string[][] = []
  let linha: string[] = []
  let campo = ''
  let aspas = false
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (aspas) {
      if (c === '"' && t[i + 1] === '"') {
        campo += '"'
        i++
      } else if (c === '"') aspas = false
      else campo += c
    } else if (c === '"') aspas = true
    else if (c === sep) {
      linha.push(campo)
      campo = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++
      linha.push(campo)
      linhas.push(linha)
      linha = []
      campo = ''
    } else campo += c
  }
  if (campo || linha.length) {
    linha.push(campo)
    linhas.push(linha)
  }
  return linhas.filter((l) => l.some((c) => c.trim()))
}

/**
 * Preço em reais escrito de vários jeitos: 32,90 · R$ 1.234,50 · 32.9 (como o Excel guarda).
 * Com vírgula, ela é a casa decimal e os pontos são milhar. Sem vírgula, o ponto é decimal.
 */
export function lerPreco(valor: string): number | null {
  let v = valor.replace(/R\$|\s/gi, '')
  if (v.includes(',')) v = v.replace(/\./g, '').replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(v)) return null
  return Number(v)
}

const SIM = new Set(['sim', 's', 'x', 'true', 'verdadeiro', '1', 'esgotado'])

const COLUNAS = {
  nome: ['nome', 'produto'],
  descricao: ['descricao', 'detalhes'],
  preco: ['preco', 'valor', 'preco (r$)'],
  categoria: ['categoria', 'secao', 'grupo'],
  esgotado: ['esgotado'],
} as const

export function lerProdutos(tabela: (string | number | boolean | Date | null)[][]): Leitura {
  const linhas = tabela.map((l) => l.map((c) => (c == null ? '' : String(c).trim())))
  const [cabecalho = [], ...resto] = linhas
  const titulos = cabecalho.map(normalizar)
  const col = (nome: keyof typeof COLUNAS) =>
    titulos.findIndex((t) => (COLUNAS[nome] as readonly string[]).includes(t))
  const idx = {
    nome: col('nome'),
    descricao: col('descricao'),
    preco: col('preco'),
    categoria: col('categoria'),
    esgotado: col('esgotado'),
  }

  const faltando = (['nome', 'preco', 'categoria'] as const).filter((c) => idx[c] < 0)
  if (faltando.length) {
    const nomes = { nome: 'nome', preco: 'preço', categoria: 'categoria' }
    return {
      produtos: [],
      erros: [
        {
          linha: 1,
          motivo: `Faltam as colunas: ${faltando.map((c) => nomes[c]).join(', ')}. A primeira linha precisa ter os títulos das colunas.`,
        },
      ],
    }
  }
  if (resto.length > MAX_LINHAS) {
    return {
      produtos: [],
      erros: [
        { linha: 1, motivo: `A planilha passa de ${MAX_LINHAS} produtos. Divida em partes.` },
      ],
    }
  }

  const produtos: LinhaProduto[] = []
  const erros: ErroLinha[] = []
  const vistos = new Set<string>()
  resto.forEach((l, i) => {
    const linha = i + 2 // +1 do cabeçalho, +1 porque a planilha começa na linha 1
    const pega = (j: number) => (j >= 0 ? (l[j] ?? '') : '')
    const nome = pega(idx.nome).slice(0, 120)
    const categoria = pega(idx.categoria).slice(0, 80)
    const preco = lerPreco(pega(idx.preco))

    if (!nome) return erros.push({ linha, motivo: 'Sem nome.' })
    if (!categoria) return erros.push({ linha, motivo: `${nome}: sem categoria.` })
    if (!pega(idx.preco)) return erros.push({ linha, motivo: `${nome}: sem preço.` })
    if (preco === null)
      return erros.push({
        linha,
        motivo: `${nome}: preço "${pega(idx.preco)}" não é um valor válido.`,
      })
    const chave = normalizar(nome)
    if (vistos.has(chave))
      return erros.push({ linha, motivo: `${nome}: aparece mais de uma vez na planilha.` })
    vistos.add(chave)

    produtos.push({
      linha,
      nome,
      descricao: pega(idx.descricao).slice(0, 500),
      preco,
      categoria,
      esgotado: SIM.has(normalizar(pega(idx.esgotado))),
    })
  })
  return { produtos, erros }
}
