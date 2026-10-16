import { describe, expect, it } from 'vitest'

import { lerItensCompra, totalDaCompra } from '@/lib/compras'

const lerOk = (json: unknown) => lerItensCompra(JSON.stringify(json), [1, 2, 3])

describe('compras', () => {
  it('lê os itens e calcula o custo por unidade pelo que foi pago', () => {
    expect(lerOk([{ ingrediente: 1, quantidade: '5', total: '160,00' }, { ingrediente: 2, quantidade: '3', total: '10' }])).toEqual({
      ok: true,
      itens: [
        { ingrediente: 1, quantidade: 5, total: 160, custo: 32 },
        { ingrediente: 2, quantidade: 3, total: 10, custo: 3.333 },
      ],
    })
  })

  it('aceita vírgula e quantidade com casas', () => {
    expect(lerOk([{ ingrediente: 3, quantidade: '2,5', total: 'R$ 1.250,00' }])).toMatchObject({ ok: true, itens: [{ quantidade: 2.5, total: 1250, custo: 500 }] })
  })

  it('recusa compra vazia, ingrediente de fora ou repetido', () => {
    expect(lerOk([])).toMatchObject({ ok: false, erro: expect.stringMatching(/pelo menos um item/) })
    expect(lerOk([{ ingrediente: 9, quantidade: '1', total: '1' }])).toMatchObject({ ok: false, erro: expect.stringMatching(/ingrediente/) })
    expect(lerOk([{ ingrediente: 1, quantidade: '1', total: '1' }, { ingrediente: 1, quantidade: '1', total: '1' }])).toMatchObject({ ok: false, erro: expect.stringMatching(/duas vezes/) })
  })

  it('recusa quantidade ou total zerado, negativo ou que não é número', () => {
    expect(lerOk([{ ingrediente: 1, quantidade: '0', total: '10' }])).toMatchObject({ ok: false, erro: expect.stringMatching(/quantidade/) })
    expect(lerOk([{ ingrediente: 1, quantidade: '-1', total: '10' }])).toMatchObject({ ok: false })
    expect(lerOk([{ ingrediente: 1, quantidade: '1', total: '0' }])).toMatchObject({ ok: false, erro: expect.stringMatching(/pagou/) })
    expect(lerOk([{ ingrediente: 1, quantidade: 1, total: 10 }])).toMatchObject({ ok: false })
  })

  it('recusa JSON quebrado ou grande demais', () => {
    expect(lerItensCompra('{', [1])).toMatchObject({ ok: false, erro: expect.stringMatching(/formato/) })
    expect(lerItensCompra('{"a":1}', [1])).toMatchObject({ ok: false })
    expect(lerItensCompra(JSON.stringify(Array.from({ length: 51 }, () => ({}))), [1])).toMatchObject({ ok: false })
  })

  it('soma o total sem erro de centavos', () => {
    expect(totalDaCompra([{ total: 0.1 }, { total: 0.2 }])).toBe(0.3)
  })
})
