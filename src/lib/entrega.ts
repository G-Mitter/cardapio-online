/**
 * Taxa de entrega por bairro, sem banco e sem tela: dá para testar sozinha.
 * Loja sem bairros cadastrados cobra a taxa única; com bairros, só entrega neles.
 */
import { normalizar, lerPreco } from './planilha'

export type Bairro = { nome: string; taxa: number }

/** Taxa para o bairro do endereço, ou null se a loja não entrega lá. */
export function taxaDoBairro(
  bairros: Bairro[] | null | undefined,
  bairro: string,
  taxaUnica: number,
): number | null {
  if (!bairros?.length) return taxaUnica
  const alvo = normalizar(bairro)
  return bairros.find((b) => normalizar(b.nome) === alvo)?.taxa ?? null
}

/** Texto do painel, um bairro por linha ("Centro = 5,00"), vira lista. Linha em branco é ignorada. */
export function lerBairros(texto: string): { ok: true; bairros: Bairro[] } | { ok: false; erro: string } {
  const bairros: Bairro[] = []
  for (const linha of texto.split('\n').map((l) => l.trim()).filter(Boolean)) {
    const [nome, valor, ...resto] = linha.split('=').map((p) => p.trim())
    const taxa = valor === undefined ? null : lerPreco(valor)
    if (!nome || resto.length || taxa === null) {
      return { ok: false, erro: `Linha inválida: "${linha}". Use o formato Centro = 5,00.` }
    }
    if (bairros.some((b) => normalizar(b.nome) === normalizar(nome))) {
      return { ok: false, erro: `O bairro ${nome} aparece duas vezes.` }
    }
    bairros.push({ nome, taxa })
  }
  return { ok: true, bairros }
}

export const bairrosComoTexto = (bairros: Bairro[]) =>
  bairros.map((b) => `${b.nome} = ${b.taxa.toFixed(2).replace('.', ',')}`).join('\n')
