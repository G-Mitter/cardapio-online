/**
 * Chamada ao Gemini (camada gratuita do Google) com a chave GEMINI_API_KEY. Usada na leitura da
 * maquininha e na conversão de planilhas de outros sistemas. Só servidor.
 */
import { textoDaResposta } from '@/lib/fotoMaquininha'

/** Troque pela variável GEMINI_MODEL se o Google mudar o nome do modelo. */
const MODELO = process.env.GEMINI_MODEL || 'gemini-3.8-flash'

/** `sem-chave`: não configurada. `cota`: a cota gratuita acabou. `falhou`: o Google respondeu erro ou algo ilegível. `rede`: sem resposta. */
export type RespostaGemini = { ok: true; json: unknown } | { ok: false; erro: 'sem-chave' | 'cota' | 'falhou' | 'rede' }

export async function chamarGemini(entrada: unknown[], esquema: object): Promise<RespostaGemini> {
  const chave = process.env.GEMINI_API_KEY
  if (!chave) return { ok: false, erro: 'sem-chave' }
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: { 'x-goog-api-key': chave, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODELO,
        input: entrada,
        response_format: { type: 'text', mime_type: 'application/json', schema: esquema },
      }),
      signal: AbortSignal.timeout(50_000),
    })
    if (res.status === 429) return { ok: false, erro: 'cota' }
    if (!res.ok) return { ok: false, erro: 'falhou' }
    const texto = textoDaResposta(await res.json())
    return { ok: true, json: texto ? JSON.parse(texto) : null }
  } catch {
    return { ok: false, erro: 'rede' }
  }
}
