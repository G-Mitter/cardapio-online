import type { Metadata } from 'next'

import { Formulario } from '@/components/painel/Formulario'
import { type PedidoImpressao, Impressao } from '@/components/painel/Impressao'
import { idDoGarcom, nomesDosGarcons, sessao } from '@/lib/painel'
import { ORIGENS, origemDoPedido } from '@/lib/origem'
import { temPermissao } from '@/lib/permissoes'
import { setoresDaLoja, setorDaCategoria } from '@/lib/setores'
import { deveImprimir, LARGURAS, lerLargura, lerVias } from '@/lib/ticket'

import { salvarImpressao } from '../../actions'

export const metadata: Metadata = { title: 'Impressão' }

const DOZE_HORAS = 12 * 3_600_000

/** Impressão automática dos pedidos: deixe esta tela aberta no computador ligado à impressora. */
export default async function PaginaImpressao() {
  const { payload, loja, user, comoUsuario } = await sessao('pedidos')
  const agora = new Date()
  // Sem nenhuma origem marcada (loja antiga, que nunca configurou) vale todas; para não imprimir, desligue a impressão.
  const escolhidas = (loja.imprimirOrigens ?? []).filter((o) => ORIGENS.some((x) => x.value === o))
  const origens = escolhidas.length ? escolhidas : ORIGENS.map((o) => o.value)
  const config = { ligada: loja.impressaoAutomatica === true, origens }
  // Só imprime o que veio depois de ligar a impressão e nas últimas 12 horas.
  const desde = Math.max(agora.getTime() - DOZE_HORAS, loja.impressaoDesde ? new Date(loja.impressaoDesde).getTime() : 0)

  const [{ docs }, { docs: categorias }] = await Promise.all([
    payload.find({
      collection: 'pedidos',
      where: { loja: { equals: loja.id }, status: { not_equals: 'cancelado' }, createdAt: { greater_than_equal: new Date(agora.getTime() - DOZE_HORAS).toISOString() } },
      sort: '-createdAt',
      limit: 60,
      depth: 0,
      ...comoUsuario,
    }),
    payload.find({ collection: 'categorias', where: { loja: { equals: loja.id } }, limit: 0, depth: 0, ...comoUsuario }),
  ])
  const ids = [...new Set(docs.flatMap((p) => (p.itens ?? []).flatMap((i) => (i.produto ? [i.produto] : []))))]
  const { docs: produtos } = ids.length
    ? await payload.find({ collection: 'produtos', where: { loja: { equals: loja.id }, id: { in: ids } }, limit: 0, depth: 0, ...comoUsuario })
    : { docs: [] }
  const setorDaCat = new Map(categorias.map((c) => [c.id, setorDaCategoria(c.setor)]))
  const porProduto = new Map(
    produtos.map((x) => [x.id, { setor: setorDaCat.get(typeof x.categoria === 'object' ? x.categoria.id : x.categoria) ?? setorDaCategoria(null), embalagem: x.naEmbalagem ?? '' }]),
  )
  const garcons = await nomesDosGarcons(payload, docs)

  const pedidos: PedidoImpressao[] = docs.map((p) => {
    const origem = origemDoPedido(p)
    return {
      id: p.id,
      numero: p.numero,
      createdAt: p.createdAt,
      nome: p.nome,
      telefone: p.telefone ?? '',
      modo: p.modo,
      balcao: Boolean(p.balcao),
      mesa: p.mesa ?? '',
      garcom: garcons.get(idDoGarcom(p) ?? -1) ?? '',
      endereco: p.endereco ?? '',
      agendadoPara: p.agendadoPara ?? null,
      observacoes: p.observacoes ?? '',
      pagamento: p.pagamento ?? '',
      trocoPara: p.trocoPara ?? null,
      taxa: p.taxa,
      total: p.total,
      pendente: new Date(p.createdAt).getTime() >= desde && deveImprimir({ impresso: p.impresso, status: p.status, origem, agendadoPara: p.agendadoPara ?? null }, config, agora),
      itens: (p.itens ?? []).map((i) => ({
        nome: i.nome,
        quantidade: i.quantidade,
        opcoes: i.opcoes ?? '',
        precoUnitario: i.precoUnitario,
        setor: porProduto.get(i.produto ?? -1)?.setor ?? setorDaCategoria(null),
        // Para viagem; quem come na mesa não leva embalagem.
        embalagem: p.mesa ? '' : (porProduto.get(i.produto ?? -1)?.embalagem ?? ''),
      })),
    }
  })

  return (
    <>
      <h1>Impressão</h1>
      <Impressao
        loja={{ nome: loja.nome, ligada: config.ligada, largura: lerLargura(loja.larguraTicket), vias: lerVias(loja.viasTicket) }}
        setores={setoresDaLoja(categorias)}
        pedidos={pedidos}
      />
      {temPermissao(user, 'loja') && (
        <>
          <h2>Configurar</h2>
          <Formulario acao={salvarImpressao}>
            <label className="marcar">
              <input type="checkbox" name="impressaoAutomatica" defaultChecked={config.ligada} />
              Imprimir cada pedido novo automaticamente
            </label>
            <div className="linha">
              <label className="campo">
                Largura do papel
                <select name="larguraTicket" defaultValue={lerLargura(loja.larguraTicket)}>
                  {LARGURAS.map((l) => (
                    <option key={l.valor} value={l.valor}>
                      {l.rotulo}
                    </option>
                  ))}
                </select>
              </label>
              <label className="campo">
                Vias de cada ticket
                <input name="viasTicket" type="number" min={1} max={3} defaultValue={lerVias(loja.viasTicket)} />
              </label>
            </div>
            <fieldset className="opcoes">
              <legend>Imprimir pedidos de</legend>
              {ORIGENS.map((o) => (
                <label key={o.value} className="marcar">
                  <input type="checkbox" name="imprimirOrigens" value={o.value} defaultChecked={origens.includes(o.value)} />
                  {o.label}
                </label>
              ))}
            </fieldset>
            <button className="botao">Salvar</button>
          </Formulario>
        </>
      )}
    </>
  )
}
