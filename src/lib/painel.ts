import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { cache } from 'react'

import config from '@/payload.config'

/** Cookie com a loja escolhida no painel, para quem tem mais de uma (você, como administrador). */
export const COOKIE_LOJA = 'painel-loja'

/**
 * Quem está usando o painel e de qual loja. Sem login, manda para a tela de entrar.
 * Usado em toda página e em toda ação do painel: nada é salvo sem passar por aqui.
 *
 * As gravações vão com `user` e `overrideAccess: false`, então o Payload ainda confere
 * (pelo plugin de multi-cliente) que o dono só mexe na loja dele.
 */
export const sessao = cache(async () => {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/painel/entrar')

  // Só as lojas que este usuário pode editar (o plugin filtra; o administrador vê todas).
  const { docs: lojas } = await payload.find({
    collection: 'lojas',
    user,
    overrideAccess: false,
    depth: 1,
    limit: 0,
    sort: 'nome',
  })
  const escolhida = Number((await cookies()).get(COOKIE_LOJA)?.value)
  const loja = lojas.find((l) => l.id === escolhida) ?? lojas[0]
  if (!loja) redirect('/painel/entrar?sem-loja=1')

  return { payload, user, loja, lojas, comoUsuario: { user, overrideAccess: false } as const }
})
