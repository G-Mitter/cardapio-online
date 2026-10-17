import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload, type Payload } from 'payload'
import { cache } from 'react'

import { type Permissao, temPermissao } from '@/lib/permissoes'
import config from '@/payload.config'

/** Cookie com a loja escolhida no painel, para quem tem mais de uma (você, como administrador). */
export const COOKIE_LOJA = 'painel-loja'

/** Cookie com o caixa aberto em que este aparelho está trabalhando (o do balcão, por exemplo). */
export const COOKIE_CAIXA = 'painel-caixa'

/**
 * Quem está usando o painel e de qual loja. Sem login, manda para a tela de entrar.
 * Usado em toda página e em toda ação do painel: nada é salvo sem passar por aqui.
 *
 * As gravações vão com `user` e `overrideAccess: false`, então o Payload ainda confere
 * (pelo plugin de multi-cliente) que o dono só mexe na loja dele.
 *
 * Garçom não passa por aqui: `sessao` o manda para a tela dele, então nenhuma página nem
 * ação do dono funciona para garçom. Telas de garçom usam `sessaoGarcom`.
 *
 * `permissao` é a área que a página ou ação usa; sem ela o usuário vai para "sem acesso". O argumento é
 * obrigatório de propósito (o TypeScript não deixa esquecer); `null` vale para qualquer usuário logado.
 */
export const sessao = async (permissao: Permissao | null) => {
  const s = await sessaoGarcom(permissao)
  if (s.garcom) redirect('/painel/garcom')
  return s
}

/** Como `sessao`, mas aceita o garçom (e diz quem é). Só para as telas e ações feitas para ele. */
export const sessaoGarcom = cache(async (permissao: Permissao | null) => {
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
  if (permissao && !temPermissao(user, permissao)) redirect('/painel/sem-acesso')
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

/** Nome de cada garçom (por id) para mostrar nos pedidos de mesa. O garçom não tem acesso próprio: o servidor lê. */
export async function nomesDosGarcons(
  payload: Payload,
  pedidos: { garcom?: number | { id: number } | null }[],
) {
  const ids = [
    ...new Set(
      pedidos.flatMap((p) =>
        p.garcom ? [typeof p.garcom === 'object' ? p.garcom.id : p.garcom] : [],
      ),
    ),
  ]
  if (!ids.length) return new Map<number, string>()
  const { docs } = await payload.find({
    collection: 'users',
    where: { id: { in: ids } },
    limit: ids.length,
    depth: 0,
  })
  return new Map(docs.map((g) => [g.id, g.nome ?? g.username ?? 'Garçom']))
}

/** Id do garçom que lançou o pedido, ou null. */
export const idDoGarcom = (p: { garcom?: number | { id: number } | null }) =>
  p.garcom ? (typeof p.garcom === 'object' ? p.garcom.id : p.garcom) : null

/** Grava o cookie de login (o mesmo do /admin: quem entra no painel também está logado lá). */
export async function iniciarSessao(payload: Payload, resultado: { token?: string; exp?: number }) {
  ;(await cookies()).set(`${payload.config.cookiePrefix}-token`, resultado.token ?? '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: resultado.exp ? new Date(resultado.exp * 1000) : undefined,
  })
}
