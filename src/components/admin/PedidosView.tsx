import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import type { AdminViewServerProps } from 'payload'

import { inicioDoDia, ordenar } from '@/lib/pedidosDoDia'

import { PainelPedidos } from './PainelPedidos'

/** Tela /admin/pedidos-de-hoje: os pedidos do dia da loja, com troca de status em um toque. */
export async function PedidosView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, permissions, visibleEntities, locale } = initPageResult
  const { user, payload, i18n } = req

  // Com overrideAccess: false o plugin de multi-cliente só devolve os pedidos das lojas do usuário.
  const pedidos = user
    ? (
        await payload.find({
          collection: 'pedidos',
          where: { createdAt: { greater_than_equal: inicioDoDia() } },
          user,
          overrideAccess: false,
          depth: 1,
          limit: 500,
        })
      ).docs
    : []

  const lista = ordenar(
    pedidos.map((p) => ({
      id: p.id,
      numero: p.numero,
      status: p.status,
      createdAt: p.createdAt,
      loja: typeof p.loja === 'object' && p.loja ? p.loja.nome : '',
      nome: p.nome,
      modo: p.modo,
      endereco: p.endereco ?? '',
      observacoes: p.observacoes ?? '',
      total: p.total,
      itens: (p.itens ?? []).map((i) => ({ nome: i.nome, quantidade: i.quantidade })),
    })),
  )
  const variasLojas = new Set(lista.map((p) => p.loja)).size > 1

  return (
    <DefaultTemplate
      i18n={i18n}
      locale={locale}
      params={params}
      payload={payload}
      permissions={permissions}
      searchParams={searchParams}
      user={user ?? undefined}
      visibleEntities={visibleEntities}
    >
      <Gutter>
        <h1>Pedidos de hoje</h1>
        <PainelPedidos pedidos={lista} mostrarLoja={variasLojas} />
      </Gutter>
    </DefaultTemplate>
  )
}
