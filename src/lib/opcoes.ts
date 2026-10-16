/**
 * Adicionais e opções do produto (tamanho, borda, extras), sem banco e sem tela.
 * Cada grupo tem um mínimo (1 se for obrigatório) e um máximo de escolhas;
 * cada item pode somar um valor ao preço do produto.
 */
import { lerPreco, normalizar } from './planilha'

export type ItemOpcao = { id: string; nome: string; preco: number }
export type GrupoOpcao = { id: string; nome: string; min: number; max: number; itens: ItemOpcao[] }

/** Escolhas do cliente: id do grupo → ids dos itens marcados. */
export type Escolhas = Record<string, string[]>

/** Grupo como o painel grava, ainda sem os ids que o banco dá. */
export type GrupoNovo = { nome: string; min: number; max: number; itens: { nome: string; preco: number }[] }

/**
 * Texto do painel vira grupos. Linha sem "-" abre um grupo ("Tamanho: obrigatório, até 1");
 * linha com "-" é um item do grupo ("- Grande = 8,00"; sem "=", o item não custa nada).
 */
export function lerOpcoes(texto: string): { ok: true; grupos: GrupoNovo[] } | { ok: false; erro: string } {
  const grupos: GrupoNovo[] = []
  for (const linha of texto.split('\n').map((l) => l.trim()).filter(Boolean)) {
    if (linha.startsWith('-')) {
      const atual = grupos.at(-1)
      const [nome, valor, ...resto] = linha.slice(1).split('=').map((p) => p.trim())
      const preco = valor === undefined ? 0 : lerPreco(valor)
      if (!atual) return { ok: false, erro: `O item "${linha}" precisa vir depois do nome de um grupo.` }
      if (!nome || resto.length || preco === null) {
        return { ok: false, erro: `Item inválido: "${linha}". Use o formato - Grande = 8,00.` }
      }
      atual.itens.push({ nome, preco })
      continue
    }
    const [nome, regras = ''] = linha.split(/:(.*)/s).map((p) => p.trim())
    const grupo: GrupoNovo = { nome, min: 0, max: 1, itens: [] }
    for (const regra of regras.split(',').map((r) => normalizar(r)).filter(Boolean)) {
      const ate = regra.match(/^ate (\d+)$/)
      if (regra === 'obrigatorio') grupo.min = 1
      else if (ate && Number(ate[1]) >= 1) grupo.max = Number(ate[1])
      else return { ok: false, erro: `Regra inválida em "${linha}". Use "obrigatório" e/ou "até 3".` }
    }
    if (!nome) return { ok: false, erro: `Linha inválida: "${linha}". Itens começam com "-".` }
    grupos.push(grupo)
  }
  for (const g of grupos) {
    if (!g.itens.length) return { ok: false, erro: `O grupo ${g.nome} não tem itens.` }
    g.max = Math.min(g.max, g.itens.length)
  }
  return { ok: true, grupos }
}

/**
 * Confere as escolhas contra os grupos do produto e devolve o que elas somam ao preço
 * e o texto que vai no pedido ("Grande, Borda catupiry"). Roda no navegador (mostrar o
 * preço) e no servidor (o que vale).
 */
export function resolverEscolhas(
  grupos: GrupoOpcao[],
  escolhas: Escolhas | undefined,
): { ok: true; adicional: number; descricao: string } | { ok: false; erro: string } {
  const feitas = escolhas ?? {}
  if (Object.keys(feitas).some((id) => !grupos.some((g) => g.id === id))) {
    return { ok: false, erro: 'Uma das opções não existe mais. Atualize a página.' }
  }
  let centavos = 0
  const nomes: string[] = []
  for (const g of grupos) {
    const ids = feitas[g.id] ?? []
    if (!Array.isArray(ids) || new Set(ids).size !== ids.length) return { ok: false, erro: `Escolha inválida em ${g.nome}.` }
    const itens = ids.map((id) => g.itens.find((i) => i.id === id))
    if (itens.some((i) => !i)) return { ok: false, erro: 'Uma das opções não existe mais. Atualize a página.' }
    if (ids.length < g.min) return { ok: false, erro: `Escolha uma opção em ${g.nome}.` }
    if (ids.length > g.max) return { ok: false, erro: `Em ${g.nome}, escolha no máximo ${g.max}.` }
    for (const i of itens) {
      centavos += Math.round(i!.preco * 100)
      nomes.push(i!.nome)
    }
  }
  return { ok: true, adicional: centavos / 100, descricao: nomes.join(', ') }
}

/** Grupos como o Payload devolve (ids opcionais no tipo) para o formato da tela. */
export const gruposDoProduto = (
  opcoes:
    | {
        id?: string | null
        nome: string
        min?: number | null
        max?: number | null
        itens?: { id?: string | null; nome: string; preco?: number | null }[] | null
      }[]
    | null
    | undefined,
): GrupoOpcao[] =>
  (opcoes ?? []).map((g, n) => ({
    id: g.id ?? String(n),
    nome: g.nome,
    min: g.min ?? 0,
    max: g.max ?? 1,
    itens: (g.itens ?? []).map((i, m) => ({ id: i.id ?? String(m), nome: i.nome, preco: i.preco ?? 0 })),
  }))

/** Grupo como a tela do painel manda (JSON no campo `opcoes`). */
export type GrupoDaTela = { nome: string; obrigatorio: boolean; max: number; itens: { nome: string; preco: number }[] }

/**
 * Lê o JSON do painel e confere nome, valor e máximo no servidor: a tela só ajuda, o que vale é isto.
 * O máximo nunca passa da quantidade de itens.
 */
export function lerOpcoesDaTela(json: string): { ok: true; grupos: GrupoNovo[] } | { ok: false; erro: string } {
  let cru: unknown
  try {
    cru = json.trim() ? JSON.parse(json) : []
  } catch {
    return { ok: false, erro: 'Não consegui ler as opções. Atualize a página e tente de novo.' }
  }
  if (!Array.isArray(cru)) return { ok: false, erro: 'Não consegui ler as opções. Atualize a página e tente de novo.' }
  const grupos: GrupoNovo[] = []
  for (const g of cru as Partial<GrupoDaTela>[]) {
    const nome = String(g?.nome ?? '').trim().slice(0, 60)
    if (!nome) return { ok: false, erro: 'Todo grupo de opções precisa de um nome.' }
    const itens: GrupoNovo['itens'] = []
    for (const i of Array.isArray(g.itens) ? g.itens : []) {
      const descricao = String(i?.nome ?? '').trim().slice(0, 60)
      const preco = Number(i?.preco ?? 0)
      if (!descricao) return { ok: false, erro: `Todo item do grupo ${nome} precisa de uma descrição.` }
      if (!Number.isFinite(preco) || preco < 0 || preco > 99999) return { ok: false, erro: `Valor inválido em ${descricao} (${nome}).` }
      itens.push({ nome: descricao, preco: Math.round(preco * 100) / 100 })
    }
    if (!itens.length) return { ok: false, erro: `O grupo ${nome} não tem itens.` }
    const max = Math.trunc(Number(g.max))
    if (!(max >= 1)) return { ok: false, erro: `Máximo de escolhas inválido em ${nome}.` }
    grupos.push({ nome, min: g.obrigatorio ? 1 : 0, max: Math.min(max, itens.length), itens })
  }
  return { ok: true, grupos }
}
