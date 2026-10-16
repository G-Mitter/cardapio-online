import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { PainelPedidos } from '@/components/painel/PainelPedidos'
import { PrimeirosPassos } from '@/components/painel/PrimeirosPassos'
import { idDoGarcom, nomesDosGarcons, sessao, sessaoGarcom } from '@/lib/painel'
import { primeiraTela, temPermissao } from '@/lib/permissoes'
import { inicioDoDia, ordenar } from '@/lib/pedidosDoDia'
import { primeirosPassos } from '@/lib/primeirosPassos'

export const metadata: Metadata = { title: 'Pedidos de hoje' }

/** Tela inicial do painel: os pedidos do dia, com troca de status em um toque. */
export default async function Pedidos() {
  // Quem não mexe nos pedidos cai na primeira tela que pode usar.
  const { user } = await sessaoGarcom(null)
  if (!temPermissao(user, 'pedidos')) redirect(primeiraTela(user))
  const { payload, loja, comoUsuario } = await sessao('pedidos')
  // Só quem edita a loja vê a lista (é ele que pode dispensá-la), e só enquanto não a dispensou.
  const mostrarPassos = temPermissao(user, 'loja') && !loja.passosDispensados
  // As leituras não dependem uma da outra: vão juntas ao banco.
  const [{ docs }, { docs: entregadores }, produtos] = await Promise.all([
    payload.find({
      collection: 'pedidos',
      where: { loja: { equals: loja.id }, createdAt: { greater_than_equal: inicioDoDia() } },
      depth: 0,
      limit: 500,
      ...comoUsuario,
    }),
    payload.find({
      collection: 'entregadores',
      where: { loja: { equals: loja.id }, ativo: { not_equals: false } },
      sort: 'nome',
      depth: 0,
      limit: 0,
      ...comoUsuario,
    }),
    mostrarPassos
      ? payload.count({ collection: 'produtos', where: { loja: { equals: loja.id } }, ...comoUsuario })
      : null,
  ])
  const passos = mostrarPassos
    ? primeirosPassos(loja, produtos?.totalDocs ?? 0).filter((p) => temPermissao(user, p.permissao))
    : []
  const garcons = await nomesDosGarcons(payload, docs)
  const nomeDoEntregador = new Map(entregadores.map((e) => [e.id, e.nome]))

  const pedidos = ordenar(
    docs.map((p) => ({
      id: p.id,
      numero: p.numero,
      status: p.status,
      createdAt: p.createdAt,
      nome: p.nome,
      telefone: p.telefone ?? '',
      modo: p.modo,
      balcao: Boolean(p.balcao),
      mesa: p.mesa ?? '',
      garcom: garcons.get(idDoGarcom(p) ?? -1) ?? '',
      endereco: p.endereco ?? '',
      entregadorId: typeof p.entregador === 'number' ? p.entregador : null,
      entregador: typeof p.entregador === 'number' ? (nomeDoEntregador.get(p.entregador) ?? '') : '',
      observacoes: p.observacoes ?? '',
      agendadoPara: p.agendadoPara ?? null,
      pagamento: p.pagamento ?? '',
      trocoPara: p.trocoPara ?? null,
      cpf: p.cpf ?? '',
      // O código em si não vai para a tela: quem mostra é o cliente.
      pedeCodigo: p.modo === 'retirada' && Boolean(p.codigoRetirada),
      total: p.total,
      itens: (p.itens ?? []).map((i) => ({ nome: i.nome, quantidade: i.quantidade, opcoes: i.opcoes ?? '' })),
    })),
  )

  return (
    <>
      <div className="titulo">
        <h1>Pedidos de hoje</h1>
        <Link href="/painel/novo-pedido" className="botao">
          Novo pedido
        </Link>
      </div>
      {passos.some((p) => !p.feito) && <PrimeirosPassos passos={passos} />}
      <PainelPedidos
        pedidos={pedidos}
        loja={loja.nome}
        entregadores={entregadores.map((e) => ({ id: e.id, nome: e.nome, whatsapp: e.whatsapp }))}
      />
    </>
  )
}
