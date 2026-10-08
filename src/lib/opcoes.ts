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

export const opcoesComoTexto = (grupos: { nome: string; min: number; max: number; itens: { nome: string; preco: number }[] }[]) =>
  grupos
    .map((g) => {
      const regras = [g.min > 0 && 'obrigatório', g.max > 1 && `até ${g.max}`].filter(Boolean).join(', ')
      const itens = g.itens.map((i) => `- ${i.nome}${i.preco ? ` = ${i.preco.toFixed(2).replace('.', ',')}` : ''}`)
      return [`${g.nome}${regras ? `: ${regras}` : ''}`, ...itens].join('\n')
    })
    .join('\n')

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
