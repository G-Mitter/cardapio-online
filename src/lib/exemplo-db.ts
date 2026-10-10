/**
 * Grava os dados de exemplo da Cantina Dona Lurdes no banco. As regras de leitura das planilhas estão em
 * src/lib/exemplo.ts; aqui só se grava. Repetir a importação não duplica: apaga o que os exemplos criam
 * (pedidos, financeiro, cupons, garçons, entregadores, carrinhos) e recria. Produtos, categorias, fotos
 * e clientes não são apagados. Quem chama confere que é o administrador e que a loja é a de demonstração
 * (painel/(logado)/exemplo/actions.ts).
 */
import { randomInt } from 'node:crypto'

import type { Payload } from 'payload'

import type { Loja } from '@/payload-types'
import { PADRAO } from '@/seed/exemplo/padrao'

import { buscarCliente } from './clientes-db'
import { hojeEmBrasilia } from './entregadores'
import {
  type Erro,
  lerProdutosExemplo,
  lerTabela,
  momento,
  NOMES,
  type Nome,
  type Planilhas,
  planejar,
  relatorioMaquininha,
  type VendaCartao,
} from './exemplo'
import { gruposDoProduto } from './opcoes'
import { normalizar } from './planilha'

export type Dono = { payload: Payload; user: { id: number }; loja: Loja }

/** Guarda a data de criação e de atualização como o exemplo pede (o Payload sempre grava "agora"). */
const datar = (payload: Payload, collection: 'pedidos' | 'fechamentos' | 'acertos' | 'carrinhos', id: number, criado: Date, atualizado = criado) =>
  payload.db.updateOne({
    collection,
    id,
    data: { createdAt: criado.toISOString(), updatedAt: atualizado.toISOString() },
    returning: false,
  })

export type ResultadoExemplo =
  | { ok: true; resumo: [string, number][]; avisos: string[] }
  | { ok: false; erro?: string; erros?: Erro[] }

/** `enviadas`: planilhas editadas pelo usuário (nome → texto CSV); as que faltam usam a padrão. */
export async function gravarExemplo({ payload, user, loja }: Dono, enviadas: Partial<Record<Nome, string>>): Promise<ResultadoExemplo> {
  const agora = new Date()

  const planilhas = {} as Planilhas
  for (const n of NOMES) {
    const t = enviadas?.[n]
    planilhas[n] = typeof t === 'string' && t.trim() ? t.slice(0, 500_000) : PADRAO[n]
  }

  const buscaProdutos = () =>
    payload.find({ collection: 'produtos', where: { loja: { equals: loja.id } }, limit: 0, depth: 0, overrideAccess: true })

  // 1. Produtos: opções, selos e promoções da planilha. É seguro repetir, então vai antes das outras conferências.
  const lidos = lerProdutosExemplo(lerTabela(planilhas.produtos))
  const erros: Erro[] = [...lidos.erros]
  const existentes = await buscaProdutos()
  const idPorNome = new Map(existentes.docs.map((p) => [normalizar(p.nome), p.id]))
  for (const p of lidos.produtos) {
    if (!idPorNome.has(normalizar(p.nome))) erros.push({ arquivo: 'produtos', linha: p.linha, motivo: `O produto "${p.nome}" não existe no cardápio da Cantina.` })
  }
  if (erros.length) return { ok: false, erros }
  for (const p of lidos.produtos) {
    await payload.update({
      collection: 'produtos',
      id: idPorNome.get(normalizar(p.nome))!,
      data: { opcoes: p.opcoes, selos: p.selos as never, leve: p.leve, pague: p.pague },
      overrideAccess: true,
    })
  }

  // 2. Planejar tudo antes de apagar qualquer coisa: planilha com erro não estraga os dados.
  const produtos = (await buscaProdutos()).docs.map((p) => ({
    id: p.id,
    nome: p.nome,
    preco: p.preco,
    // Os exemplos são pedidos do passado: um produto esgotado hoje podia estar à venda na época.
    esgotado: false,
    leve: p.leve,
    pague: p.pague,
    opcoes: gruposDoProduto(p.opcoes),
  }))
  const r = planejar(planilhas, { agora, loja: { taxaEntrega: loja.taxaEntrega ?? 0 }, produtos })
  if (!r.ok) return { ok: false, erros: r.erros }
  const { plano } = r
  const donos = { loja: { equals: loja.id } }

  // 3. Apagar o que os exemplos criam (filhos antes dos pais).
  for (const collection of ['acertos', 'fechamentos', 'pedidos', 'lancamentos', 'carrinhos', 'cupons', 'entregadores'] as const) {
    await payload.delete({ collection, where: donos, overrideAccess: true })
  }
  await payload.delete({
    collection: 'users',
    where: { lojaDoGarcom: { equals: loja.id }, roles: { contains: 'garcom' } },
    overrideAccess: true,
  })

  // 4. Loja
  await payload.update({
    collection: 'lojas',
    id: loja.id,
    data: {
      mesas: plano.loja.mesas,
      atendimentoMesas: plano.loja.atendimentoMesas,
      taxaServico: plano.loja.taxaServico,
      chavePix: plano.loja.chavePix,
      bairros: plano.loja.bairros,
    },
    overrideAccess: true,
  })

  for (const c of plano.cupons) await payload.create({ collection: 'cupons', data: { ...c, loja: loja.id }, overrideAccess: true })

  const garcom = new Map<string, number>()
  for (const g of plano.garcons) {
    const u = await payload.create({
      collection: 'users',
      data: { username: `${g.usuario}.${loja.slug}`, password: g.senha, nome: g.nome, roles: ['garcom'], lojaDoGarcom: loja.id, ativo: g.ativo },
      overrideAccess: true,
    })
    garcom.set(g.usuario, u.id)
  }
  const entregador = new Map<string, number>()
  for (const e of plano.entregadores) {
    const d = await payload.create({ collection: 'entregadores', data: { ...e, loja: loja.id }, overrideAccess: true })
    entregador.set(e.nome, d.id)
  }
  for (const c of plano.clientes) {
    const existente = await buscarCliente(payload, c.telefone)
    if (existente) await payload.update({ collection: 'clientes', id: existente.id, data: { nome: c.nome, enderecos: c.enderecos }, overrideAccess: true })
    else await payload.create({ collection: 'clientes', data: { ...c, aceitouEm: agora.toISOString() }, overrideAccess: true })
  }

  // 5. Pedidos (em ordem de data, então o número cresce com o tempo)
  const pedidoId = new Map<string, number>()
  for (const p of plano.pedidos) {
    const doc = await payload.create({
      collection: 'pedidos',
      overrideAccess: true,
      data: {
        loja: loja.id,
        numero: p.numero,
        status: p.status as never,
        itens: p.pedido.itens.map(({ produto, nome, quantidade, precoUnitario, opcoes, escolhas }) => ({
          produto: Number(produto),
          nome,
          quantidade,
          precoUnitario,
          opcoes,
          escolhas,
        })),
        subtotal: p.pedido.subtotal,
        taxa: p.pedido.taxa,
        promocao: p.pedido.promocao,
        desconto: p.pedido.desconto,
        cupom: p.pedido.cupom,
        total: p.pedido.total,
        modo: p.modo,
        mesa: p.mesa || undefined,
        garcom: p.garcom ? garcom.get(p.garcom) : undefined,
        pediuConta: p.pediuConta,
        contaFechada: Boolean(p.fechamento),
        balcao: p.balcao,
        nome: p.nome,
        telefone: p.telefone ?? undefined,
        endereco: p.endereco,
        entregador: p.entregador ? entregador.get(p.entregador) : undefined,
        agendadoPara: p.agendadoPara,
        pagamento: p.pagamento,
        trocoPara: p.trocoPara,
        cpf: p.cpf ?? undefined,
        observacoes: p.observacoes,
        codigoRetirada: p.modo === 'retirada' && !p.balcao && !p.mesa ? String(randomInt(10_000)).padStart(4, '0') : undefined,
      },
    })
    await datar(payload, 'pedidos', doc.id, p.criado, p.atualizado)
    pedidoId.set(p.ref, doc.id)
  }

  for (const f of plano.fechamentos) {
    const doc = await payload.create({
      collection: 'fechamentos',
      overrideAccess: true,
      data: {
        loja: loja.id,
        mesa: f.mesa,
        pedidos: plano.pedidos.filter((p) => p.fechamento === f.ref).map((p) => pedidoId.get(p.ref)!),
        subtotal: f.subtotal,
        taxaServico: f.taxaServico,
        total: f.total,
        pagamentos: f.pagamentos,
        troco: f.troco,
        garcom: f.garcom ? garcom.get(f.garcom) : undefined,
        fechadoPor: user.id,
      },
    })
    await datar(payload, 'fechamentos', doc.id, f.criado)
  }

  for (const a of plano.acertos) {
    const doc = await payload.create({
      collection: 'acertos',
      overrideAccess: true,
      data: {
        loja: loja.id,
        entregador: entregador.get(a.entregador)!,
        dia: a.dia,
        pedidos: a.pedidos.map((ref) => pedidoId.get(ref)!),
        dinheiro: a.dinheiro,
        cartao: a.cartao,
        pix: a.pix,
        troco: a.troco,
        taxas: a.taxas,
        descontouTaxa: a.descontouTaxa,
        esperado: a.esperado,
        entregue: a.entregue,
        diferenca: a.diferenca,
        conferidoPor: user.id,
      },
    })
    await datar(payload, 'acertos', doc.id, momento(a.dia, 0, '22:00', agora) ?? agora)
  }

  for (const l of plano.lancamentos) {
    await payload.create({
      collection: 'lancamentos',
      overrideAccess: true,
      data: { ...l, categoria: l.categoria as never, loja: loja.id, diaDoMes: Number(l.vencimento.slice(8)) },
    })
  }

  for (const c of plano.carrinhos) {
    const doc = await payload.create({
      collection: 'carrinhos',
      overrideAccess: true,
      data: { loja: loja.id, telefone: c.telefone, nome: c.nome, resumo: c.resumo, total: c.total },
    })
    await datar(payload, 'carrinhos', doc.id, c.atualizado)
  }

  return {
    ok: true,
    resumo: [
      ['Pedidos', plano.pedidos.length],
      ['Contas de mesa fechadas', plano.fechamentos.length],
      ['Acertos de entregador', plano.acertos.length],
      ['Contas a pagar e a receber', plano.lancamentos.length],
      ['Cupons', plano.cupons.length],
      ['Garçons', plano.garcons.length],
      ['Entregadores', plano.entregadores.length],
      ['Clientes', plano.clientes.length],
      ['Carrinhos abandonados', plano.carrinhos.length],
    ],
    avisos: [],
  }
}

/**
 * Relatório de maquininha de exemplo, feito dos pedidos em cartão que estão no banco, para testar
 * "Conferir a maquininha": falta a venda de um pedido de ontem e sobra uma venda sem pedido.
 */
export async function montarRelatorioExemplo({ payload, loja }: Dono): Promise<{ ok: true; csv: string } | { ok: false; erro: string }> {
  const agora = new Date()
  const base = { limit: 0, depth: 0, overrideAccess: true } as const
  const [pedidos, fechamentos] = await Promise.all([
    payload.find({ collection: 'pedidos', where: { loja: { equals: loja.id }, status: { equals: 'entregue' }, pagamento: { equals: 'cartao' }, mesa: { exists: false } }, sort: 'createdAt', ...base }),
    payload.find({ collection: 'fechamentos', where: { loja: { equals: loja.id } }, sort: 'createdAt', ...base }),
  ])
  // A venda passa na maquininha uns minutos depois de o pedido ser feito.
  const vendas: VendaCartao[] = pedidos.docs.map((p) => ({ quando: new Date(new Date(p.createdAt).getTime() + 12 * 60_000), valor: p.total }))
  for (const f of fechamentos.docs) {
    for (const x of f.pagamentos ?? []) if (x.forma === 'cartao') vendas.push({ quando: new Date(f.createdAt), valor: x.valor })
  }
  if (!vendas.length) return { ok: false, erro: 'Não há vendas em cartão. Importe os dados de exemplo primeiro.' }

  const ontem = hojeEmBrasilia(new Date(agora.getTime() - 24 * 3600_000))
  const deOntem = vendas.map((v, i) => [v, i] as const).filter(([v]) => hojeEmBrasilia(v.quando) === ontem)
  if (deOntem.length) vendas.splice(deOntem.at(-1)![1], 1)
  vendas.push({ quando: new Date(`${ontem}T15:10:00-03:00`), valor: 37.5 })
  return { ok: true, csv: relatorioMaquininha(vendas) }
}
