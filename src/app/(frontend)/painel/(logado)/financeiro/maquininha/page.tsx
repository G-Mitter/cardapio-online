import type { Metadata } from 'next'
import Link from 'next/link'

import { ConferirMaquininha } from '@/components/painel/ConferirMaquininha'
import { sessao } from '@/lib/painel'

export const metadata: Metadata = { title: 'Conferir a maquininha' }

export default async function Maquininha() {
  await sessao()
  return (
    <>
      <p>
        <Link href="/painel/financeiro">← Financeiro</Link>
      </p>
      <h1>Conferir a maquininha</h1>
      <ConferirMaquininha />
    </>
  )
}
