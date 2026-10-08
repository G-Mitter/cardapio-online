import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { escolhasPorNome, lerEntregue, lerItens, lerRecebido, momento, NOMES, type Planilhas, planejar, relatorioMaquininha } from '@/lib/exemplo'
import { conferir, lerRelatorio, type PagamentoLoja } from '@/lib/maquininha'
import { gruposDoProduto, lerOpcoes } from '@/lib/opcoes'
import type { ProdutoParaPedido } from '@/lib/pedido'
import { lerTabela } from '@/lib/exemplo'

const pasta = path.resolve(__dirname, '../../src/seed/exemplo')
const planilhas = Object.fromEntries(NOMES.map((n) => [n, readFileSync(path.join(pasta, `${n}.csv`), 'utf8')])) as Planilhas

/** Produtos da Cantina como o seed cria, com as opções da planilha de produtos. */
function produtos(): ProdutoParaPedido[] {
  const base: [string, number][] = [
    ['Feijão tropeiro', 32.9], ['Frango com quiabo', 34.9], ['Vaca atolada', 39.9], ['Salada da casa', 27.9], ['Jantar a dois', 119.9],
    ['Pizza de frango', 49.9], ['Torresmo de barriga', 29.9], ['Pão de queijo', 14], ['Suco de laranja', 9], ['Refrigerante lata', 6],
  ]
  const extra = new Map(lerTabela(planilhas.produtos).map((l) => [l.produto, l]))
  return base.map(([nome, preco], i) => {
    const l = extra.get(nome)
    const o = lerOpcoes(l?.opcoes ?? '')
    return {
      id: i + 1,
      nome,
      preco,
      esgotado: false,
      leve: l?.leve ? Number(l.leve) : null,
      pague: l?.pague ? Number(l.pague) : null,
      opcoes: o.ok ? gruposDoProduto(o.grupos) : [],
    }
  })
}

const agora = new Date('2026-10-08T18:00:00-03:00') // 18h em Brasília
const plano = () => {
  const r = planejar(planilhas, { agora, loja: { taxaEntrega: 6 }, produtos: produtos() })
  if (!r.ok) throw new Error(JSON.stringify(r.erros, null, 2))
  return r.plano
}

describe('lerItens', () => {
  it('lê quantidade, produto e opções por nome', () => {
    const r = lerItens('2x Pizza de frango (Tamanho: Grande; Borda: Catupiry) | 1x Suco de laranja')
    expect(r).toEqual({
      ok: true,
      itens: [
        { quantidade: 2, produto: 'Pizza de frango', opcoes: { Tamanho: ['Grande'], Borda: ['Catupiry'] } },
        { quantidade: 1, produto: 'Suco de laranja', opcoes: {} },
      ],
    })
    expect(lerItens('pizza').ok).toBe(false)
  })
  it('opções que não existem dão erro', () => {
    const grupos = produtos()[5].opcoes!
    expect(escolhasPorNome(grupos, { Tamanho: ['Gigante'] }).ok).toBe(false)
    expect(escolhasPorNome(grupos, { Cor: ['Azul'] }).ok).toBe(false)
  })
})

describe('momento', () => {
  it('é relativo a hoje e nunca no futuro', () => {
    expect(momento('2026-10-08', -1, '12:30', agora)?.toISOString()).toBe('2026-10-07T15:30:00.000Z')
    expect(momento('2026-10-08', 0, '23:00', agora)).toEqual(agora)
    expect(momento('2026-10-08', 0, '25h', agora)).toBeNull()
  })
})

describe('lerRecebido e lerEntregue', () => {
  it('"resto" completa o total e "auto" dá troco', () => {
    expect(lerRecebido('dinheiro=100; cartao=resto', 150, '')).toEqual({
      ok: true,
      recebido: [{ forma: 'dinheiro', valor: 100 }, { forma: 'cartao', valor: 50 }],
    })
    expect(lerRecebido('dinheiro=resto', 83.4, 'auto')).toEqual({ ok: true, recebido: [{ forma: 'dinheiro', valor: 90 }] })
    expect(lerRecebido('ouro=1', 10, '').ok).toBe(false)
  })
  it('entregue = esperado com ajuste', () => {
    expect(lerEntregue('esperado', 100)).toBe(100)
    expect(lerEntregue('esperado-10', 100)).toBe(90)
    expect(lerEntregue('esperado+5,50', 100)).toBe(105.5)
    expect(lerEntregue('80,00', 100)).toBe(80)
  })
})

describe('planilhas padrão', () => {
  it('viram um plano sem erros', () => {
    const p = plano()
    expect(p.pedidos).toHaveLength(46)
    expect(p.pedidos.map((x) => x.numero)).toEqual(Array.from({ length: 46 }, (_, i) => i + 1))
    expect(p.fechamentos).toHaveLength(7)
    expect(p.acertos).toHaveLength(3)
    expect(p.lancamentos).toHaveLength(13)
  })
  it('cobre todos os canais, status, cupons e promoções', () => {
    const p = plano()
    const tem = (f: (x: ReturnType<typeof plano>['pedidos'][number]) => boolean) => p.pedidos.some(f)
    expect(tem((x) => x.balcao)).toBe(true)
    expect(tem((x) => x.mesa !== '')).toBe(true)
    expect(tem((x) => x.modo === 'entrega')).toBe(true)
    expect(tem((x) => x.modo === 'retirada' && !x.balcao && !x.mesa)).toBe(true)
    expect(tem((x) => Boolean(x.agendadoPara))).toBe(true)
    expect(tem((x) => x.pedido.desconto > 0)).toBe(true)
    expect(tem((x) => x.pedido.promocao > 0)).toBe(true)
    expect(tem((x) => x.pedido.taxa > 0)).toBe(true)
    expect(tem((x) => x.pediuConta)).toBe(true)
    for (const s of ['novo', 'preparando', 'pronto', 'entregue', 'cancelado']) expect(tem((x) => x.status === s)).toBe(true)
  })
  it('taxa de entrega vem do bairro', () => {
    const p = plano()
    const savassi = p.pedidos.find((x) => x.endereco.endsWith('Savassi'))!
    expect(savassi.pedido.taxa).toBe(7)
  })
  it('mesas fechadas têm taxa de serviço, pagamento dividido e troco', () => {
    const p = plano()
    expect(p.fechamentos.some((f) => f.taxaServico > 0)).toBe(true)
    expect(p.fechamentos.some((f) => f.pagamentos.length > 1)).toBe(true)
    expect(p.fechamentos.some((f) => f.troco > 0)).toBe(true)
    for (const f of p.fechamentos) expect(Math.round(f.pagamentos.reduce((s, x) => s + x.valor, 0) * 100)).toBe(Math.round(f.total * 100))
  })
  it('acertos: confere, faltou e sobrou', () => {
    const d = plano().acertos.map((a) => a.diferenca)
    expect(d).toContain(0)
    expect(d).toContain(-10)
    expect(d).toContain(5)
  })
  it('contas: vencida, hoje, fixa e paga', () => {
    const l = plano().lancamentos
    expect(l.some((x) => !x.pagoEm && x.vencimento < '2026-10-08')).toBe(true)
    expect(l.some((x) => !x.pagoEm && x.vencimento === '2026-10-08')).toBe(true)
    expect(l.some((x) => x.repetir)).toBe(true)
    expect(l.some((x) => x.pagoEm && x.valorPago !== x.valor)).toBe(true)
  })
  it('erro mostra arquivo e linha, e nada vira plano', () => {
    const r = planejar({ ...planilhas, pedidos: planilhas.pedidos + 'X1;0;10:00;entrega;novo;Zé;31900000001;Rua A;Bairro Inventado;1x Pão de queijo;;pix;;;;;;;;;;\n' }, { agora, loja: { taxaEntrega: 6 }, produtos: produtos() })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erros[0]).toMatchObject({ arquivo: 'pedidos', motivo: expect.stringContaining('Bairro Inventado') })
  })
})

describe('relatório de maquininha de exemplo', () => {
  it('é lido por "Conferir a maquininha" e casa com as vendas', () => {
    const vendas = [
      { quando: new Date('2026-10-07T15:12:00Z'), valor: 58.9 },
      { quando: new Date('2026-10-07T16:30:00Z'), valor: 92 },
    ]
    const leitura = lerRelatorio(relatorioMaquininha(vendas))
    expect(leitura.erros).toEqual([])
    expect(leitura.vendas.map((v) => [v.valor, v.tipo])).toEqual([[58.9, 'débito'], [92, 'crédito']])
    expect(leitura.vendas[0].taxa).toBe(1.17)
    const pagamentos: PagamentoLoja[] = [{ id: 'a', rotulo: 'A', valor: 58.9, de: vendas[0].quando.getTime() - 600_000, ate: vendas[0].quando.getTime() + 600_000 }]
    const c = conferir(leitura.vendas, pagamentos)
    expect(c.confere).toHaveLength(1)
    expect(c.soNaMaquininha).toHaveLength(1)
  })
})
