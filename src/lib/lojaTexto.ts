/**
 * Horário e endereço da loja ficam em campos de seleção no painel, mas continuam guardados como um
 * texto só (o cardápio mostra o texto e a rota de entrega usa o endereço). Estas funções montam
 * esse texto e o leem de volta para preencher os campos de novo.
 */

export const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const

export type Horario = { dias: number[]; abre: string; fecha: string }

const hora = (t: string) => {
  const [h, m] = t.split(':')
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`
}

/** "Seg a Sex e Dom: 11h às 15h". Vazio se faltar dia ou hora. Dias de 0 (segunda) a 6 (domingo). */
export function montarHorario({ dias, abre, fecha }: Horario): string {
  const d = [...new Set(dias)].filter((n) => n >= 0 && n <= 6).sort((a, b) => a - b)
  if (!d.length || !abre || !fecha) return ''
  const partes: string[] = []
  for (let i = 0; i < d.length; ) {
    let j = i
    while (j + 1 < d.length && d[j + 1] === d[j] + 1) j++
    if (j - i >= 2) partes.push(`${DIAS[d[i]]} a ${DIAS[d[j]]}`)
    else for (let k = i; k <= j; k++) partes.push(DIAS[d[k]])
    i = j + 1
  }
  const lista = partes.length > 1 ? `${partes.slice(0, -1).join(', ')} e ${partes.at(-1)}` : partes[0]
  return `${lista}: ${hora(abre)} às ${hora(fecha)}`
}

/** Lê de volta o texto de `montarHorario`. Texto de outro formato (digitado à mão antes) devolve null. */
export function lerHorario(texto: string): Horario | null {
  const m = /^(.+): (\d{1,2})h(\d{2})? às (\d{1,2})h(\d{2})?$/.exec(texto.trim())
  if (!m) return null
  const dias: number[] = []
  for (const item of m[1].split(/, | e /)) {
    const faixa = /^(\S+) a (\S+)$/.exec(item)
    const de = DIAS.indexOf((faixa ? faixa[1] : item) as (typeof DIAS)[number])
    const ate = faixa ? DIAS.indexOf(faixa[2] as (typeof DIAS)[number]) : de
    if (de < 0 || ate < de) return null
    for (let n = de; n <= ate; n++) dias.push(n)
  }
  const t = (h: string, min?: string) => `${h.padStart(2, '0')}:${min ?? '00'}`
  return { dias, abre: t(m[2], m[3]), fecha: t(m[4], m[5]) }
}

export type EnderecoLoja = { rua: string; numero: string; bairro: string; cidade: string }

/** "Rua dos Timbiras, 1200, Savassi, Belo Horizonte": só junta o que foi preenchido. */
export const montarEndereco = ({ rua, numero, bairro, cidade }: EnderecoLoja) =>
  [rua, numero, bairro, cidade].map((p) => p.trim()).filter(Boolean).join(', ')

/** Com quatro partes separadas por vírgula vira os quatro campos; outro formato vai inteiro para "Rua". */
export function lerEndereco(texto: string): EnderecoLoja {
  const partes = texto.split(',').map((p) => p.trim())
  if (partes.length === 4) return { rua: partes[0], numero: partes[1], bairro: partes[2], cidade: partes[3] }
  return { rua: texto.trim(), numero: '', bairro: '', cidade: '' }
}
