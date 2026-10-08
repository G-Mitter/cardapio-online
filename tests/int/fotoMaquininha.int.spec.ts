import { describe, expect, it } from 'vitest'

import {
  avaliarFoto,
  conferirSoma,
  juntarLeituras,
  lerRespostaGemini,
  lerTextoOcr,
  medirImagem,
  textoDaResposta,
  vendasParaCsv,
} from '@/lib/fotoMaquininha'
import { lerRelatorio } from '@/lib/maquininha'

/** Imagem de teste: listras pretas e brancas (nítida) ou cinza uniforme com leve ruído (sem foco). */
const imagem = (w: number, h: number, f: (x: number, y: number) => number) => Uint8ClampedArray.from({ length: w * h }, (_, i) => f(i % w, Math.floor(i / w)))

describe('qualidade da foto', () => {
  it('foto nítida passa e foto sem foco não', () => {
    const nitida = medirImagem(imagem(100, 100, (x) => (x % 4 < 2 ? 40 : 230)), 100, 100)
    const borrada = medirImagem(imagem(100, 100, (x, y) => 150 + (x + y) / 20), 100, 100)
    expect(nitida.nitidez).toBeGreaterThan(1000)
    expect(borrada.nitidez).toBeLessThan(10)
    expect(avaliarFoto({ largura: 1200, altura: 1600, ...nitida }).ok).toBe(true)
    expect(avaliarFoto({ largura: 1200, altura: 1600, ...borrada })).toMatchObject({ ok: false, motivo: expect.stringContaining('tremida') })
  })
  it('foto pequena, escura ou clara demais pede outra', () => {
    const ok = { largura: 1200, altura: 1600, brilho: 180, nitidez: 500 }
    expect(avaliarFoto({ ...ok, largura: 400 })).toMatchObject({ ok: false, motivo: expect.stringContaining('pequena') })
    expect(avaliarFoto({ ...ok, brilho: 30 })).toMatchObject({ ok: false, motivo: expect.stringContaining('escura') })
    expect(avaliarFoto({ ...ok, brilho: 250 })).toMatchObject({ ok: false, motivo: expect.stringContaining('clara') })
  })
})

const RECIBO = `RELATORIO DE VENDAS
Data: 08/10/2026
Visa Debito 12:41 R$ 58,90
Mastercard Credito 13:05 R$ 1.092,00
Elo Debito 19:22 46,00
Pix 19:30 R$ 20,00
TOTAL DEBITO R$ 104,90
TOTAL CREDITO R$ 1.092,00
TOTAL GERAL R$ 1.196,90
`

describe('texto do OCR', () => {
  it('acha vendas, tipo, bandeira, data e totais; ignora Pix', () => {
    const l = lerTextoOcr(RECIBO)
    expect(l.vendas).toEqual([
      { dia: '2026-10-08', hora: '12:41', valor: 58.9, tipo: 'débito', bandeira: 'Visa' },
      { dia: '2026-10-08', hora: '13:05', valor: 1092, tipo: 'crédito', bandeira: 'Mastercard' },
      { dia: '2026-10-08', hora: '19:22', valor: 46, tipo: 'débito', bandeira: 'Elo' },
    ])
    expect(l).toMatchObject({ totalImpresso: 1196.9, totalDebito: 104.9, totalCredito: 1092, dia: '2026-10-08' })
  })
  it('a soma tem de bater com o total impresso', () => {
    const l = lerTextoOcr(RECIBO)
    expect(conferirSoma(l)).toMatchObject({ ok: true })
    // O total geral inclui o Pix (20,00): sem ele a soma é 1.196,90 - 20,00 = não bate, então testamos com um total sem Pix.
    expect(conferirSoma({ vendas: l.vendas, totalImpresso: 1196.9 }).ok).toBe(true)
    expect(conferirSoma({ vendas: l.vendas.slice(0, 2), totalImpresso: 1196.9 })).toMatchObject({ ok: false, motivo: expect.stringContaining('não bate') })
    expect(conferirSoma({ vendas: [], totalImpresso: null })).toMatchObject({ ok: false })
  })
  it('junta duas fotos sem repetir a venda que aparece nas duas', () => {
    const a = lerTextoOcr('08/10/2026\nVisa Debito 12:41 58,90\nElo Credito 13:00 10,00')
    const b = lerTextoOcr('08/10/2026\nElo Credito 13:00 10,00\nVisa Debito 14:00 5,00\nTOTAL 73,90')
    const j = juntarLeituras([a, b])
    expect(j.vendas).toHaveLength(3)
    expect(j.totalImpresso).toBe(73.9)
    expect(conferirSoma(j).ok).toBe(true)
  })
  it('vira o CSV do conferidor', () => {
    const csv = vendasParaCsv(lerTextoOcr(RECIBO).vendas)
    const r = lerRelatorio(csv)
    expect(r.erros).toEqual([])
    expect(r.vendas.map((v) => [v.valor, v.tipo, v.bandeira])).toEqual([[58.9, 'débito', 'Visa'], [1092, 'crédito', 'Mastercard'], [46, 'débito', 'Elo']])
  })
})

describe('resposta do Gemini', () => {
  it('lê o texto de output_text ou do passo model_output', () => {
    expect(textoDaResposta({ output_text: '{"a":1}' })).toBe('{"a":1}')
    expect(textoDaResposta({ steps: [{ type: 'thought' }, { type: 'model_output', content: [{ text: '{"b":' }, { text: '2}' }] }] })).toBe('{"b":2}')
    expect(textoDaResposta({})).toBeNull()
  })
  it('foto ruim vira pedido de nova foto com o motivo', () => {
    expect(lerRespostaGemini({ foto_boa: false, motivo: 'A parte de baixo ficou cortada.', vendas: [] })).toEqual({ ok: false, motivo: 'A parte de baixo ficou cortada.' })
  })
  it('lê vendas, descarta Pix e valores ruins', () => {
    const r = lerRespostaGemini({
      foto_boa: true,
      data_relatorio: '2026-10-08',
      total_impresso: 120,
      vendas: [
        { data: '2026-10-08', hora: '9:05', valor: 100, tipo: 'débito', bandeira: 'Visa' },
        { data: '2026-10-08', hora: '10:00', valor: 20, tipo: 'crédito' },
        { data: '2026-10-08', hora: '11:00', valor: 5, tipo: 'pix' },
        { data: '2026-10-08', hora: 'xx', valor: 5, tipo: 'débito' },
        { data: '2026-10-08', hora: '12:00', valor: -3, tipo: 'débito' },
      ],
    })
    expect(r.ok && r.leitura.vendas.map((v) => [v.hora, v.valor, v.tipo])).toEqual([['09:05', 100, 'débito'], ['10:00', 20, 'crédito']])
    expect(r.ok && conferirSoma(r.leitura).ok).toBe(true)
  })
})
