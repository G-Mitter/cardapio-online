import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import type { AdminViewServerProps } from 'payload'

import { Importador } from './Importador'

/** Tela /admin/importar: o dono da loja envia uma planilha e cadastra os produtos de uma vez. */
export async function ImportarView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, permissions, visibleEntities, locale } = initPageResult
  const { user, payload, i18n } = req

  // Só as lojas que este usuário pode editar (o plugin de multi-cliente filtra).
  const lojas = user
    ? (
        await payload.find({
          collection: 'lojas',
          user,
          overrideAccess: false,
          depth: 0,
          limit: 0,
          sort: 'nome',
        })
      ).docs.map((l) => ({ id: l.id, nome: l.nome, slug: l.slug }))
    : []

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
        <h1>Importar produtos</h1>
        {user ? <Importador lojas={lojas} /> : <p>Entre no painel para importar produtos.</p>}
      </Gutter>
    </DefaultTemplate>
  )
}
