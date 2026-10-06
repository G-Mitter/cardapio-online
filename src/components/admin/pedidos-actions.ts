'use server'

import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { STATUS, type Status } from '@/lib/pedidosDoDia'
import config from '@/payload.config'

/** Troca o status de um pedido como o usuário logado: o dono só mexe nos pedidos da loja dele. */
export async function mudarStatus(id: number, status: Status): Promise<{ ok: boolean }> {
  if (!STATUS.includes(status)) return { ok: false }
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) return { ok: false }
  try {
    await payload.update({
      collection: 'pedidos',
      id,
      data: { status },
      user,
      overrideAccess: false,
    })
    return { ok: true }
  } catch {
    return { ok: false }
  }
}
