/**
 * Dados de exemplo da Cantina Dona Lurdes, sem banco e sem tela: dá para testar sozinho.
 * As planilhas ficam em src/seed/exemplo; aqui elas viram um plano (o que criar), com os preços,
 * promoções, cupons e taxas calculados pelas mesmas regras do pedido de verdade. Datas são relativas
 * ao dia da importação (0 = hoje, -1 = ontem), para as telas "do dia" sempre terem o que mostrar.
 */
import { fimDoDia, type Cupom, normalizarCodigo } from './cupom'
import { fecharPagamento, totalDaConta, type Recebido } from './conta'
import { type Bairro, lerBairros, taxaDoBairro } from './entrega'
import { calcularAcerto, diferencaDoAcerto, hojeEmBrasilia } from './entregadores'
import { somarDias } from './financeiro'
import { lerMesas } from './mesas'
import { type Escolhas, type GrupoNovo, type GrupoOpcao, lerOpcoes } from './opcoes'
import { FORMAS_PAGAMENTO, type FormaPagamento, lerCpf, montarPedido, type Pedido, type ProdutoParaPedido } from './pedido'
import { lerCsv, lerPreco, normalizar } from './planilha'
import { lerSelos } from './selos'
import { normalizarTelefone } from './cliente'

export const SLUG_EXEMPLO = 'cantina-dona-lurdes'

export const NOMES = [
  'loja',
  'produtos',
  'cupons',
  'garcons',
  'entregadores',
  'clientes',
  'pedidos',
  'fechamentos',
  'acertos',
  'lancamentos',
  'carrinhos',
] as const
export type Nome = (typeof NOMES)[number]
export type Planilhas = Record<Nome, string>

export type Erro = { arquivo: Nome; linha: number; motivo: string }

type Linha = Record<string, string>

/** CSV com cabeçalho: cada linha vira um objeto pelo título da coluna (linhas vazias são ignoradas). */
export function lerTabela(texto: string): Linha[] {
  const [cab = [], ...resto] = lerCsv(texto)
  return resto
    .filter((l) => l.some((c) => c.trim()))
    .map((l, i) => ({ ...Object.fromEntries(cab.map((h, j) => [h.trim(), (l[j] ?? '').trim()])), _linha: String(i + 2) }))
}

const sim = (t: string | undefined) => /^(sim|s|true|1)$/.test(normalizar(t ?? ''))
const inteiro = (t: string | undefined) => (/^-?\d+$/.test((t ?? '').trim()) ? Number(t) : null)

/** "dia" da planilha (0, -1, -2) e "hora" (HH:MM, horário de Brasília) viram o momento; nunca no futuro. */
export function momento(hoje: string, dia: number, hora: string, agora: Date): Date | null {
  const m = hora.match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  const d = new Date(`${somarDias(hoje, dia)}T${m[1].padStart(2, '0')}:${m[2]}:00-03:00`)
  if (Number.isNaN(d.getTime())) return null
  return d > agora ? agora : d
}

export type ItemLido = { quantidade: number; produto: string; opcoes: Record<string, string[]> }

/** "2x Pizza (Tamanho: Grande; Borda: Catupiry) | 1x Suco" → itens com as opções escolhidas por nome. */
export function lerItens(texto: string): { ok: true; itens: ItemLido[] } | { ok: false; erro: string } {
  const itens: ItemLido[] = []
  for (const parte of texto.split('|').map((p) => p.trim()).filter(Boolean)) {
    const m = parte.match(/^(\d+)\s*x\s+(.+?)(?:\s*\((.*)\))?$/i)
    if (!m) return { ok: false, erro: `Item inválido: "${parte}". Use o formato 2x Produto (Grupo: Opção).` }
    const opcoes: Record<string, string[]> = {}
    for (const g of (m[3] ?? '').split(';').map((x) => x.trim()).filter(Boolean)) {
      const [nome, resto] = g.split(':').map((x) => x.trim())
      if (!nome || !resto) return { ok: false, erro: `Opções inválidas em "${parte}". Use (Grupo: Opção; Grupo: Opção).` }
      opcoes[nome] = resto.split(',').map((x) => x.trim()).filter(Boolean)
    }
    itens.push({ quantidade: Number(m[1]), produto: m[2].trim(), opcoes })
  }
  return itens.length ? { ok: true, itens } : { ok: false, erro: 'Pedido sem itens.' }
}

/** Opções escolhidas por nome → ids do cardápio (o que o pedido guarda). */
export function escolhasPorNome(
  grupos: GrupoOpcao[],
  porNome: Record<string, string[]>,
): { ok: true; escolhas: Escolhas } | { ok: false; erro: string } {
  const escolhas: Escolhas = {}
  for (const [nomeGrupo, nomesItens] of Object.entries(porNome)) {
    const g = grupos.find((x) => normalizar(x.nome) === normalizar(nomeGrupo))
    if (!g) return { ok: false, erro: `Grupo de opções "${nomeGrupo}" não existe neste produto.` }
    const ids: string[] = []
    for (const n of nomesItens) {
      const item = g.itens.find((i) => normalizar(i.nome) === normalizar(n))
      if (!item) return { ok: false, erro: `Opção "${n}" não existe em "${nomeGrupo}".` }
      ids.push(item.id)
    }
    escolhas[g.id] = ids
  }
  return { ok: true, escolhas }
}

/**
 * "dinheiro=100; cartao=resto": o que a mesa pagou. "metade" é metade do total e "resto" o que falta. Com troco "auto",
 * quem paga em dinheiro entrega a próxima nota de R$ 10 e recebe o troco.
 */
export function lerRecebido(
  texto: string,
  total: number,
  troco: string,
): { ok: true; recebido: Recebido[] } | { ok: false; erro: string } {
  const partes: { forma: FormaPagamento; valor: string }[] = []
  for (const p of texto.split(';').map((x) => x.trim()).filter(Boolean)) {
    const [forma, valor] = p.split('=').map((x) => x.trim())
    const f = FORMAS_PAGAMENTO.find((x) => x.value === forma)?.value
    if (!f || !valor) return { ok: false, erro: `Pagamento inválido: "${p}". Use forma=valor ou forma=resto.` }
    partes.push({ forma: f, valor })
  }
  let outros = 0
  const metade = Math.floor(Math.round(total * 100) / 2)
  const centavos = (v: string) => (v === 'metade' ? metade : Math.round((lerPreco(v) ?? NaN) * 100))
  for (const p of partes) if (p.valor !== 'resto') outros += centavos(p.valor)
  if (Number.isNaN(outros)) return { ok: false, erro: `Valor de pagamento inválido em "${texto}".` }
  const resto = Math.max(0, Math.round(total * 100) - outros)
  const recebido = partes.map(({ forma, valor }) => {
    let c = valor === 'resto' ? resto : centavos(valor)
    if (troco === 'auto' && forma === 'dinheiro') c = Math.ceil(c / 1000) * 1000
    return { forma, valor: c / 100 }
  })
  return { ok: true, recebido }
}

/** "esperado", "esperado+5", "esperado-10" ou um valor em reais: quanto o entregador entregou. */
export function lerEntregue(texto: string, esperado: number): number | null {
  const m = texto.match(/^esperado(?:\s*([+-])\s*(\d+(?:[.,]\d+)?))?$/i)
  if (!m) return lerPreco(texto)
  const delta = m[2] ? Math.round((lerPreco(m[2]) ?? 0) * 100) * (m[1] === '-' ? -1 : 1) : 0
  return (Math.round(esperado * 100) + delta) / 100
}

// ---------- Plano ----------

export type PlanoPedido = {
  ref: string
  numero: number
  criado: Date
  atualizado: Date
  status: string
  nome: string
  telefone: string | null
  modo: 'entrega' | 'retirada'
  balcao: boolean
  mesa: string
  garcom: string
  pediuConta: boolean
  endereco: string
  entregador: string
  agendadoPara?: string
  pagamento?: FormaPagamento
  trocoPara: number | null
  cpf: string | null
  observacoes: string
  fechamento: string
  pedido: Pedido
}

export type Plano = {
  loja: { mesas: string; atendimentoMesas: 'ambos' | 'garcom' | 'cliente'; taxaServico: number; chavePix: string; bairros: Bairro[] }
  produtos: ReturnType<typeof lerProdutosExemplo>['produtos']
  cupons: (Cupom & { codigo: string })[]
  garcons: { nome: string; usuario: string; senha: string; ativo: boolean }[]
  entregadores: { nome: string; whatsapp: string; ativo: boolean }[]
  clientes: { telefone: string; nome: string; enderecos: { rua: string; complemento: string; bairro: string }[] }[]
  pedidos: PlanoPedido[]
  fechamentos: {
    ref: string
    criado: Date
    mesa: string
    garcom: string
    subtotal: number
    taxaServico: number
    total: number
    pagamentos: Recebido[]
    troco: number
  }[]
  acertos: {
    entregador: string
    dia: string
    pedidos: string[]
    dinheiro: number
    cartao: number
    pix: number
    troco: number
    taxas: number
    descontouTaxa: boolean
    esperado: number
    entregue: number
    diferenca: number
  }[]
  lancamentos: {
    tipo: 'pagar' | 'receber'
    descricao: string
    valor: number
    vencimento: string
    categoria?: string
    observacao: string
    repetir: boolean
    pagoEm?: string
    valorPago?: number
  }[]
  carrinhos: { telefone: string; nome: string; resumo: string; total: number; atualizado: Date }[]
}

/** A planilha de produtos (opções, selos e promoção por nome de produto). */
export function lerProdutosExemplo(tabela: Linha[]) {
  const erros: Erro[] = []
  const produtos: { linha: number; nome: string; selos: string[]; leve: number | null; pague: number | null; opcoes: GrupoNovo[] }[] = []
  for (const l of tabela) {
    const o = lerOpcoes(l.opcoes ?? '')
    if (!o.ok) {
      erros.push({ arquivo: 'produtos', linha: Number(l._linha), motivo: o.erro })
      continue
    }
    produtos.push({
      linha: Number(l._linha),
      nome: l.produto,
      selos: lerSelos((l.selos ?? '').split(',').map((s) => s.trim())),
      leve: inteiro(l.leve),
      pague: inteiro(l.pague),
      opcoes: o.grupos,
    })
  }
  return { produtos, erros }
}

export type ContextoPlano = {
  agora: Date
  loja: { taxaEntrega: number | null }
  /** Os produtos da loja como estão no banco, já com as opções da planilha de produtos aplicadas. */
  produtos: ProdutoParaPedido[]
}

const ATENDIMENTOS = ['ambos', 'garcom', 'cliente'] as const

/** Lê as planilhas e monta tudo o que vai ser criado. Qualquer erro vem com arquivo e linha, e nada é criado. */
export function planejar(
  planilhas: Planilhas,
  ctx: ContextoPlano,
): { ok: true; plano: Plano } | { ok: false; erros: Erro[] } {
  const erros: Erro[] = []
  const falha = (arquivo: Nome, l: Linha | number, motivo: string) =>
    erros.push({ arquivo, linha: typeof l === 'number' ? l : Number(l._linha), motivo })
  const hoje = hojeEmBrasilia(ctx.agora)
  const t = Object.fromEntries(NOMES.map((n) => [n, lerTabela(planilhas[n])])) as Record<Nome, Linha[]>

  // Loja: campo;valor
  const campos = Object.fromEntries(t.loja.map((l) => [l.campo, l.valor]))
  const mesas = lerMesas(campos.mesas ?? '')
  if (!mesas.ok) falha('loja', 1, mesas.erro)
  const bairros = lerBairros(campos.bairros ?? '')
  if (!bairros.ok) falha('loja', 1, bairros.erro)
  const atendimento = ATENDIMENTOS.find((a) => a === campos.atendimentoMesas) ?? 'ambos'
  const taxaServico = Number((campos.taxaServico ?? '0').replace(',', '.')) || 0
  const listaBairros = bairros.ok ? bairros.bairros : []

  const produtos = lerProdutosExemplo(t.produtos)
  erros.push(...produtos.erros)

  const cupons: Plano['cupons'] = []
  for (const l of t.cupons) {
    const valor = lerPreco(l.valor)
    const dias = inteiro(l.vale_ate_dias)
    if (valor === null || !l.codigo) {
      falha('cupons', l, 'Código ou valor inválido.')
      continue
    }
    cupons.push({
      codigo: normalizarCodigo(l.codigo),
      tipo: l.tipo === 'valor' ? 'valor' : 'porcentagem',
      valor,
      minimo: l.minimo ? lerPreco(l.minimo) : null,
      validoAte: dias === null ? null : fimDoDia(somarDias(hoje, dias)),
      limiteUso: inteiro(l.limite),
      usos: inteiro(l.usos) ?? 0,
      ativo: sim(l.ativo),
    })
  }

  const garcons = t.garcons.map((l) => ({ nome: l.nome, usuario: l.usuario.toLowerCase(), senha: l.senha, ativo: sim(l.ativo) }))
  for (const l of t.garcons) if (!/^[a-z0-9_-]{3,20}$/.test(l.usuario) || l.senha.length < 6) falha('garcons', l, 'Usuário (3 a 20 letras minúsculas ou números) e senha (6 ou mais) precisam ser válidos.')
  const entregadores = t.entregadores.map((l) => ({ nome: l.nome, whatsapp: l.whatsapp, ativo: sim(l.ativo) }))

  const clientes: Plano['clientes'] = []
  for (const l of t.clientes) {
    const telefone = normalizarTelefone(l.telefone)
    if (!telefone || !l.nome) {
      falha('clientes', l, 'Telefone (DDD + número) e nome são obrigatórios.')
      continue
    }
    clientes.push({ telefone, nome: l.nome, enderecos: l.rua && l.bairro ? [{ rua: l.rua, complemento: l.complemento, bairro: l.bairro }] : [] })
  }

  const porNome = new Map(ctx.produtos.map((p) => [normalizar(p.nome), p]))

  // Pedidos
  const rascunhos: (Omit<PlanoPedido, 'numero'> & { linha: number })[] = []
  for (const l of t.pedidos) {
    const dia = inteiro(l.dia)
    const criado = dia === null ? null : momento(hoje, dia, l.hora, ctx.agora)
    if (!criado) {
      falha('pedidos', l, 'Dia (0, -1, -2...) ou hora (HH:MM) inválidos.')
      continue
    }
    const canal = l.canal
    if (!['entrega', 'retirada', 'balcao', 'mesa'].includes(canal)) {
      falha('pedidos', l, `Canal "${canal}" inválido. Use entrega, retirada, balcao ou mesa.`)
      continue
    }
    if (canal === 'mesa' && !(mesas.ok && mesas.mesas.includes(l.mesa))) {
      falha('pedidos', l, `A mesa "${l.mesa}" não existe na loja.`)
      continue
    }
    const lidos = lerItens(l.itens)
    if (!lidos.ok) {
      falha('pedidos', l, lidos.erro)
      continue
    }
    const escolhidos = []
    let ruim = false
    for (const i of lidos.itens) {
      const p = porNome.get(normalizar(i.produto))
      if (!p) {
        falha('pedidos', l, `Produto "${i.produto}" não existe no cardápio.`)
        ruim = true
        break
      }
      const e = escolhasPorNome(p.opcoes ?? [], i.opcoes)
      if (!e.ok) {
        falha('pedidos', l, `${i.produto}: ${e.erro}`)
        ruim = true
        break
      }
      escolhidos.push({ produto: p.id, quantidade: i.quantidade, escolhas: e.escolhas })
    }
    if (ruim) continue

    const modo = canal === 'entrega' ? 'entrega' : 'retirada'
    let taxa = 0
    if (modo === 'entrega') {
      const x = taxaDoBairro(listaBairros, l.bairro, ctx.loja.taxaEntrega ?? 0)
      if (x === null) {
        falha('pedidos', l, `A loja não entrega no bairro "${l.bairro}".`)
        continue
      }
      taxa = x
    }
    const cupom = l.cupom ? cupons.find((c) => c.codigo === normalizarCodigo(l.cupom)) : undefined
    if (l.cupom && !cupom) {
      falha('pedidos', l, `Cupom "${l.cupom}" não está na planilha de cupons.`)
      continue
    }
    // O cupom vale como estava no momento do pedido: a validade e os usos são conferidos na importação.
    const r = montarPedido(ctx.produtos, escolhidos, taxa, modo, cupom && { ...cupom, validoAte: null, usos: 0, limiteUso: null })
    if (!r.ok) {
      falha('pedidos', l, r.erro)
      continue
    }
    const forma = FORMAS_PAGAMENTO.find((f) => f.value === l.pagamento)?.value
    if (canal !== 'mesa' && !forma) {
      falha('pedidos', l, 'Forma de pagamento inválida. Use dinheiro, cartao ou pix.')
      continue
    }
    // "auto": o cliente paga com a próxima nota de R$ 50 acima do total.
    const trocoPara =
      forma !== 'dinheiro' || !l.troco_para ? null : l.troco_para === 'auto' ? (Math.floor(r.pedido.total / 50) + 1) * 50 : lerPreco(l.troco_para)
    if (trocoPara !== null && trocoPara < r.pedido.total) {
      falha('pedidos', l, `Troco para ${trocoPara} é menor que o total do pedido (${r.pedido.total}).`)
      continue
    }
    const cpf = l.cpf ? lerCpf(l.cpf) : null
    if (l.cpf && !cpf) {
      falha('pedidos', l, 'CPF inválido.')
      continue
    }

    let agendadoPara: string | undefined
    if (l.agendado_hora) {
      const rel = l.agendado_hora.match(/^\+(\d+)m$/)
      const d = rel
        ? new Date(ctx.agora.getTime() + Number(rel[1]) * 60_000)
        : momento(hoje, inteiro(l.agendado_dia) ?? 0, l.agendado_hora, new Date(8.64e15))
      if (!d) {
        falha('pedidos', l, 'Agendamento inválido. Use dia (0, 1) e hora (HH:MM) ou +50m.')
        continue
      }
      agendadoPara = d.toISOString()
    }

    const entregue = l.status === 'entregue'
    rascunhos.push({
      linha: Number(l._linha),
      ref: l.ref,
      criado,
      atualizado: entregue ? new Date(Math.min(criado.getTime() + 25 * 60_000, ctx.agora.getTime())) : criado,
      status: l.status,
      nome: canal === 'mesa' ? `Mesa ${l.mesa}` : l.cliente || (canal === 'balcao' ? 'Balcão' : 'Cliente'),
      telefone: canal === 'entrega' || canal === 'retirada' ? normalizarTelefone(l.telefone) : null,
      modo,
      balcao: canal === 'balcao',
      mesa: canal === 'mesa' ? l.mesa : '',
      garcom: l.garcom,
      pediuConta: sim(l.pediu_conta),
      endereco: modo === 'entrega' ? [l.endereco, l.bairro].filter(Boolean).join(', ') : '',
      entregador: l.entregador,
      agendadoPara,
      pagamento: canal === 'mesa' ? undefined : forma,
      trocoPara,
      cpf,
      observacoes: l.observacoes,
      fechamento: l.fechamento,
      pedido: r.pedido,
    })
  }
  for (const r of rascunhos) {
    if (r.garcom && !garcons.some((g) => g.usuario === r.garcom)) falha('pedidos', r.linha, `Garçom "${r.garcom}" não está na planilha de garçons.`)
    if (r.entregador && !entregadores.some((e) => e.nome === r.entregador)) falha('pedidos', r.linha, `Entregador "${r.entregador}" não está na planilha de entregadores.`)
  }
  const pedidos: PlanoPedido[] = rascunhos
    .sort((a, b) => a.criado.getTime() - b.criado.getTime())
    .map(({ linha: _l, ...r }, i) => ({ ...r, numero: i + 1 }))

  // Contas de mesa fechadas
  const fechamentos: Plano['fechamentos'] = []
  for (const l of t.fechamentos) {
    const dia = inteiro(l.dia)
    const criado = dia === null ? null : momento(hoje, dia, l.hora, ctx.agora)
    const contas = pedidos.filter((p) => p.fechamento === l.ref)
    if (!criado || !contas.length) {
      falha('fechamentos', l, !criado ? 'Dia ou hora inválidos.' : `Nenhum pedido da planilha de pedidos tem fechamento "${l.ref}".`)
      continue
    }
    const subtotal = contas.reduce((s, p) => s + Math.round(p.pedido.total * 100), 0) / 100
    const { taxaServico: taxa, total } = totalDaConta(subtotal, taxaServico, sim(l.cobrar_taxa_servico))
    const rec = lerRecebido(l.pagamentos, total, l.troco)
    if (!rec.ok) {
      falha('fechamentos', l, rec.erro)
      continue
    }
    const pago = fecharPagamento(total, rec.recebido)
    if (!pago.ok) {
      falha('fechamentos', l, pago.erro)
      continue
    }
    fechamentos.push({
      ref: l.ref,
      criado,
      mesa: l.mesa,
      garcom: l.garcom || contas.find((p) => p.garcom)?.garcom || '',
      subtotal,
      taxaServico: taxa,
      total,
      pagamentos: pago.pagamentos,
      troco: pago.troco,
    })
  }

  // Acertos dos entregadores: o esperado vem dos pedidos entregues daquele entregador e dia.
  const acertos: Plano['acertos'] = []
  for (const l of t.acertos) {
    const dia = inteiro(l.dia)
    if (dia === null || !entregadores.some((e) => e.nome === l.entregador)) {
      falha('acertos', l, 'Entregador ou dia inválidos.')
      continue
    }
    const diaTexto = somarDias(hoje, dia)
    const feitos = pedidos.filter(
      (p) => p.modo === 'entrega' && p.status === 'entregue' && p.entregador === l.entregador && hojeEmBrasilia(p.criado) === diaTexto,
    )
    if (!feitos.length) {
      falha('acertos', l, 'Esse entregador não tem entregas nesse dia.')
      continue
    }
    const troco = lerPreco(l.troco_levou || '0') ?? 0
    const descontou = sim(l.descontou_taxa)
    const c = calcularAcerto(feitos.map((p) => ({ total: p.pedido.total, taxa: p.pedido.taxa, pagamento: p.pagamento })), troco, descontou)
    const entregue = lerEntregue(l.entregou, c.esperado)
    if (entregue === null) {
      falha('acertos', l, 'Valor entregue inválido.')
      continue
    }
    acertos.push({
      entregador: l.entregador,
      dia: diaTexto,
      pedidos: feitos.map((p) => p.ref),
      ...c,
      troco,
      descontouTaxa: descontou,
      entregue,
      diferenca: diferencaDoAcerto(entregue, c.esperado).valor,
    })
  }

  // Contas a pagar e a receber
  const lancamentos: Plano['lancamentos'] = []
  for (const l of t.lancamentos) {
    const valor = lerPreco(l.valor)
    const venc = inteiro(l.vencimento_dia)
    const pago = inteiro(l.pago_dia)
    if ((l.tipo !== 'pagar' && l.tipo !== 'receber') || !l.descricao || valor === null || venc === null) {
      falha('lancamentos', l, 'Tipo (pagar ou receber), descrição, valor e vencimento_dia são obrigatórios.')
      continue
    }
    lancamentos.push({
      tipo: l.tipo,
      descricao: l.descricao,
      valor,
      vencimento: somarDias(hoje, venc),
      categoria: l.categoria || undefined,
      observacao: l.observacao,
      repetir: sim(l.repetir),
      ...(pago !== null && { pagoEm: somarDias(hoje, pago), valorPago: l.valor_pago ? (lerPreco(l.valor_pago) ?? valor) : valor }),
    })
  }

  // Carrinhos abandonados
  const carrinhos: Plano['carrinhos'] = []
  for (const l of t.carrinhos) {
    const telefone = normalizarTelefone(l.telefone)
    const total = lerPreco(l.total)
    const min = inteiro(l.minutos_atras)
    if (!telefone || total === null || min === null || !l.resumo) {
      falha('carrinhos', l, 'Telefone, resumo, total e minutos_atras são obrigatórios.')
      continue
    }
    carrinhos.push({ telefone, nome: l.nome, resumo: l.resumo.replace(/\n/g, ', '), total, atualizado: new Date(ctx.agora.getTime() - min * 60_000) })
  }

  if (erros.length) return { ok: false, erros }
  return {
    ok: true,
    plano: {
      loja: { mesas: campos.mesas ?? '', atendimentoMesas: atendimento, taxaServico, chavePix: campos.chavePix ?? '', bairros: listaBairros },
      produtos: produtos.produtos,
      cupons,
      garcons,
      entregadores,
      clientes,
      pedidos,
      fechamentos,
      acertos,
      lancamentos,
      carrinhos,
    },
  }
}

// ---------- Relatório de maquininha de exemplo ----------

export type VendaCartao = { quando: Date; valor: number }

const dm = (dia: string) => dia.split('-').reverse().join('/')
const virg = (v: number) => v.toFixed(2).replace('.', ',')

/**
 * Relatório de maquininha (no formato que "Conferir a maquininha" lê) com as vendas dadas.
 * Débito a 1,99% pago em 1 dia; crédito a 3,49% pago em 30 dias; bandeiras em rodízio.
 */
export function relatorioMaquininha(vendas: VendaCartao[]): string {
  const bandeiras = ['Visa', 'Mastercard', 'Elo']
  const linhas = [...vendas]
    .sort((a, b) => a.quando.getTime() - b.quando.getTime())
    .map((v, i) => {
      const credito = i % 2 === 1
      const taxa = Math.round(v.valor * (credito ? 3.49 : 1.99)) / 100
      const dia = hojeEmBrasilia(v.quando)
      const hora = v.quando.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })
      return [dm(dia), hora, credito ? 'Crédito' : 'Débito', bandeiras[i % 3], virg(v.valor), virg(taxa), virg(v.valor - taxa), dm(somarDias(dia, credito ? 30 : 1))].join(';')
    })
  return ['Data da venda;Hora;Tipo;Bandeira;Valor bruto;Taxa (R$);Valor líquido;Previsão de pagamento', ...linhas].join('\n') + '\n'
}
