'use server'

/** Dados de exemplo da Cantina Dona Lurdes: só o administrador geral, só nesta loja (src/lib/exemplo-db.ts). */
import { ehAdmin } from '@/access/roles'
import type { Nome } from '@/lib/exemplo'
import { SLUG_EXEMPLO } from '@/lib/exemplo'
import { gravarExemplo, montarRelatorioExemplo, type ResultadoExemplo } from '@/lib/exemplo-db'
import { sessao } from '@/lib/painel'

async function permitido() {
  const s = await sessao()
  return ehAdmin(s.user) && s.loja.slug === SLUG_EXEMPLO ? s : null
}

const NEGADO = 'Os dados de exemplo são só para o administrador, na Cantina Dona Lurdes.'

/** `enviadas`: planilhas editadas (nome → texto CSV); as que faltam usam a padrão. */
export async function importarExemplo(enviadas: Partial<Record<Nome, string>>): Promise<ResultadoExemplo> {
  const s = await permitido()
  if (!s) return { ok: false, erro: NEGADO }
  try {
    return await gravarExemplo(s, enviadas)
  } catch (e) {
    console.error('importarExemplo', e)
    return { ok: false, erro: `A importação falhou no servidor: ${e instanceof Error ? e.message : 'erro desconhecido'}` }
  }
}

export async function relatorioMaquininhaExemplo(): Promise<{ ok: true; csv: string } | { ok: false; erro: string }> {
  const s = await permitido()
  return s ? montarRelatorioExemplo(s) : { ok: false, erro: NEGADO }
}
