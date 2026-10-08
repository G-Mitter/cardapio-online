import { describe, expect, it } from 'vitest'

import { conferir, lerRelatorio, MAQUININHAS, type PagamentoLoja, recebimentosPorData } from '@/lib/maquininha'

const em = (hhmm: string, dia = '2026-10-08') => new Date(`${dia}T${hhmm}:00-03:00`).getTime()
const pag = (id: string, valor: number, de: string, ate = de): PagamentoLoja => ({
  id,
  rotulo: id,
  valor,
  de: em(de),
  ate: em(ate),
})

describe('lerRelatorio', () => {
  it('lê o exemplo de cada maquininha', () => {
    for (const m of MAQUININHAS) {
      const r = lerRelatorio(m.exemplo)
      expect(r.erros, m.nome).toEqual([])
      expect(r.vendas, m.nome).toHaveLength(2)
      expect(r.vendas.map((v) => v.valor), m.nome).toEqual([58.9, 92])
      expect(r.vendas[0].tipo).toBe('débito')
      expect(r.vendas[1].tipo).toBe('crédito')
      expect(r.vendas[0].quando, m.nome).toBe(em('12:41'))
      expect(r.vendas[0].liquido, m.nome).toBe(57.76)
      expect(r.vendas[0].taxa, m.nome).toBeCloseTo(1.14, 2)
    }
  })
  it('sem colunas de data e valor, explica', () => {
    expect(lerRelatorio('foo;bar\n1;2').erros[0].motivo).toMatch(/data e de valor/)
  })
  it('ignora Pix e aponta linha ruim', () => {
    const r = lerRelatorio('Data;Valor;Tipo\n08/10/2026 12:00;10,00;Pix\n08/10/2026 12:10;abc;Débito\n32/13/2026;5,00;Débito\n')
    expect(r.ignoradas).toBe(1)
    expect(r.erros.map((e) => e.linha)).toEqual([3, 4])
  })
})

describe('conferir', () => {
  const vendas = lerRelatorio(
    'Data;Valor;Tipo\n08/10/2026 12:41;58,90;Débito\n08/10/2026 13:05;92,00;Crédito\n08/10/2026 15:00;20,00;Crédito\n',
  ).vendas

  it('casa por valor e horário; sobra de cada lado', () => {
    const r = conferir(vendas, [pag('A', 58.9, '12:30', '12:50'), pag('B', 92, '12:30', '12:50'), pag('C', 40, '14:00')])
    expect(r.confere.map((x) => x.pagamento.id)).toEqual(['A', 'B'])
    expect(r.soNaMaquininha.map((v) => v.valor)).toEqual([20])
    expect(r.soNoPedido.map((p) => p.id)).toEqual(['C'])
  })
  it('13:05 está a 25 min do fim do pedido: fora da tolerância de 20', () => {
    expect(conferir(vendas, [pag('B', 92, '12:30', '12:40')]).confere).toHaveLength(0)
    expect(conferir(vendas, [pag('B', 92, '12:30', '12:45')]).confere).toHaveLength(1)
  })
  it('cada pagamento casa uma vez só', () => {
    const duas = lerRelatorio('Data;Valor\n08/10/2026 12:00;10,00\n08/10/2026 12:05;10,00\n').vendas
    const r = conferir(duas, [pag('A', 10, '12:00')])
    expect(r.confere).toHaveLength(1)
    expect(r.soNaMaquininha).toHaveLength(1)
  })
  it('sem hora no relatório vale o mesmo dia', () => {
    const v = lerRelatorio('Data;Valor\n08/10/2026;10,00\n').vendas
    expect(conferir(v, [pag('A', 10, '23:50')]).confere).toHaveLength(1)
    expect(conferir(v, [{ ...pag('A', 10, '10:00'), de: em('10:00', '2026-10-09'), ate: em('10:00', '2026-10-09') }]).confere).toHaveLength(0)
  })
  it('totais e taxa efetiva', () => {
    const r = conferir(vendas.slice(0, 2), [])
    expect(r.totais.vendido).toBe(150.9)
    expect(r.totais.taxa).toBe(0)
    const m = lerRelatorio(MAQUININHAS[1].exemplo)
    const t = conferir(m.vendas, []).totais
    expect(t.taxa).toBe(3.99)
    expect(t.taxaEfetiva).toBe(2.64)
  })
})

it('recebimentosPorData soma o líquido por data prevista', () => {
  const v = lerRelatorio(MAQUININHAS[0].exemplo).vendas
  expect(recebimentosPorData(v)).toEqual([
    { data: '2026-10-09', valor: 57.76 },
    { data: '2026-11-07', valor: 89.15 },
  ])
})
