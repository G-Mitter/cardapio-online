import type { Metadata } from 'next'

import { TelaCozinha } from '@/components/painel/TelaCozinha'
import { idDoGarcom, nomesDosGarcons, sessao } from '@/lib/painel'
import { naCozinha } from '@/lib/pedidosDoDia'
import { filtrarPorSetor, setoresDaLoja, setorDaCategoria } from '@/lib/setores'

export const metadata: Metadata = { title: 'Cozinha' }

/** Pedidos em aberto, em letra grande, para ficar no tablet ou na TV da cozinha. */
export default async function Cozinha({ searchParams }: { searchParams: Promise<{ setor?: string }> }) {
  const { setor = '' } = await searchParams
  const { payload, loja, comoUsuario } = await sessao('pedidos')
  const agora = new Date()
  const { docs } = await payload.find({
    collection: 'pedidos',
    where: {
      loja: { equals: loja.id },
      status: { in: ['novo', 'preparando', 'pronto'] },
      // Agendamento vai até 7 dias adiante; pedido em aberto mais velho que isso é esquecido.
      createdAt: { greater_than_equal: new Date(agora.getTime() - 8 * 86_400_000).toISOString() },
    },
    sort: 'createdAt',
    depth: 0,
    limit: 200,
    ...comoUsuario,
  })

  const garcons = await nomesDosGarcons(payload, docs)
  const ids = [...new Set(docs.flatMap((p) => (p.itens ?? []).flatMap((i) => (i.produto ? [i.produto] : []))))]
  const { docs: produtos } = ids.length
    ? await payload.find({ collection: 'produtos', where: { loja: { equals: loja.id }, id: { in: ids } }, limit: 0, depth: 0, ...comoUsuario })
    : { docs: [] }
  const { docs: categorias } = await payload.find({ collection: 'categorias', where: { loja: { equals: loja.id } }, limit: 0, depth: 0, ...comoUsuario })
  const setorDaCat = new Map(categorias.map((c) => [c.id, setorDaCategoria(c.setor)]))
  const setores = setoresDaLoja(categorias)
  const guia = new Map(
    produtos.map((x) => [
      x.id,
      {
        comoFazer: x.modoPreparo ?? '',
        embalagem: x.naEmbalagem ?? '',
        setor: setorDaCat.get(typeof x.categoria === 'object' ? x.categoria.id : x.categoria) ?? setorDaCategoria(null),
      },
    ]),
  )
  const todos = docs
    .filter((p) => naCozinha(p.agendadoPara ?? null, agora))
    .map((p) => ({
      id: p.id,
      numero: p.numero,
      status: p.status as 'novo' | 'preparando' | 'pronto',
      createdAt: p.createdAt,
      nome: p.nome,
      modo: p.modo,
      balcao: Boolean(p.balcao),
      mesa: p.mesa ?? '',
      garcom: garcons.get(idDoGarcom(p) ?? -1) ?? '',
      agendadoPara: p.agendadoPara ?? null,
      observacoes: p.observacoes ?? '',
      itens: (p.itens ?? []).map((i) => ({
        nome: i.nome,
        quantidade: i.quantidade,
        opcoes: i.opcoes ?? '',
        // Item de produto que já saiu do cardápio fica na Cozinha.
        setor: guia.get(i.produto ?? -1)?.setor ?? setorDaCategoria(null),
        comoFazer: guia.get(i.produto ?? -1)?.comoFazer ?? '',
        // Para viagem (entrega ou retirada); quem come na mesa não leva embalagem.
        embalagem: p.mesa ? '' : (guia.get(i.produto ?? -1)?.embalagem ?? ''),
      })),
    }))

  const escolhido = setores.find((s) => s.toLowerCase() === setor.toLowerCase()) ?? ''
  return <TelaCozinha pedidos={filtrarPorSetor(todos, escolhido, setores)} setores={setores} setor={escolhido} />
}
