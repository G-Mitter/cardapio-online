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
 *
 * Garçom não passa por aqui: `sessao` o manda para a tela dele, então nenhuma página nem
 * ação do dono funciona para garçom. Telas de garçom usam `sessaoGarcom`.
 */
export const sessao = async () => {
  const s = await sessaoGarcom()
  if (s.garcom) redirect('/painel/garcom')
  return s
}

/** Como `sessao`, mas aceita o garçom (e diz quem é). Só para as telas e ações feitas para ele. */
export const sessaoGarcom = cache(async () => {
  // headers() antes de abrir o banco: o painel nunca é gerado no build, que assim não migra o banco
  // em paralelo (vários processos criando as mesmas tabelas derrubavam o build do CI).
  const h = await headers()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: h })
  if (!user || user.ativo === false) redirect('/painel/entrar')

  if (user.roles?.includes('garcom')) {
    const id = typeof user.lojaDoGarcom === 'object' ? user.lojaDoGarcom?.id : user.lojaDoGarcom
    // O garçom não tem acesso próprio aos dados: o servidor lê pela loja dele, sempre filtrando por ela.
    const loja = id ? await payload.findByID({ collection: 'lojas', id, depth: 1 }).catch(() => null) : null
    if (!loja) redirect('/painel/entrar?sem-loja=1')
    return { garcom: true as const, payload, user, loja, lojas: [loja], comoUsuario: { overrideAccess: true } as const }
  }

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

  return {
    garcom: false as const,
    payload,
    user,
    loja,
    lojas,
    comoUsuario: { user, overrideAccess: false } as const,
  }
})
