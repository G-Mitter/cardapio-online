/**
 * Compras de ingredientes, sem banco e sem tela: dá para testar sozinhas.
 * Valores em reais; o custo de cada ingrediente passa a ser o último preço pago por unidade.
 */
import { lerQuantidade } from './estoque'
import { lerPreco } from './planilha'

export type ItemCompra = { ingrediente: number; quantidade: number; total: number; custo: number }

const ERRO_FORMATO = 'Os itens da compra vieram em formato inválido. Recarregue a página.'

/**
 * Itens vindos do formulário: JSON `[{ingrediente, quantidade, total}]` (textos digitados). `total` é o que
 * se pagou pelo item e `custo` sai dele (total ÷ quantidade, com 3 casas). Ingrediente de fora da loja,
 * repetido, quantidade ou total que não passam de zero invalidam tudo, com a mensagem para mostrar.
 */
export function lerItensCompra(json: string, ingredientesDaLoja: number[]): { ok: true; itens: ItemCompra[] } | { ok: false; erro: string } {
  let cru: unknown
  try {
    cru = json ? JSON.parse(json) : []
  } catch {
    return { ok: false, erro: ERRO_FORMATO }
  }
  if (!Array.isArray(cru) || cru.length > 50) return { ok: false, erro: ERRO_FORMATO }
  if (!cru.length) return { ok: false, erro: 'Coloque pelo menos um item na compra.' }
  const itens: ItemCompra[] = []
  for (const l of cru as Record<string, unknown>[]) {
    const ingrediente = Number(l?.ingrediente)
    const quantidade = typeof l?.quantidade === 'string' ? lerQuantidade(l.quantidade) : null
    const total = typeof l?.total === 'string' ? lerPreco(l.total) : null
    if (!ingredientesDaLoja.includes(ingrediente)) return { ok: false, erro: 'Escolha o ingrediente em todas as linhas da compra.' }
    if (!quantidade) return { ok: false, erro: 'Coloque a quantidade comprada de cada item (maior que zero, por exemplo 5 ou 2,5).' }
    if (!total) return { ok: false, erro: 'Coloque quanto pagou por cada item (maior que zero, por exemplo 160,00).' }
    if (itens.some((i) => i.ingrediente === ingrediente)) return { ok: false, erro: 'Um ingrediente aparece duas vezes na compra. Some as quantidades numa linha só.' }
    itens.push({ ingrediente, quantidade, total, custo: Math.round((total / quantidade) * 1000) / 1000 })
  }
  return { ok: true, itens }
}

export const totalDaCompra = (itens: { total: number }[]) => itens.reduce((s, i) => s + Math.round(i.total * 100), 0) / 100
