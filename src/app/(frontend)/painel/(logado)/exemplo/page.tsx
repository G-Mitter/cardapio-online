import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ehAdmin } from '@/access/roles'
import { ImportarExemplo } from '@/components/painel/ImportarExemplo'
import { SLUG_EXEMPLO } from '@/lib/exemplo'
import { sessao } from '@/lib/painel'

export const metadata: Metadata = { title: 'Dados de exemplo' }

// Importar leva alguns segundos: dá folga à ação (a Vercel limita pelo plano).
export const maxDuration = 60

/** Só o administrador geral vê esta tela; as demais lojas dão "página não encontrada". */
export default async function Exemplo() {
  const { user, loja } = await sessao()
  if (!ehAdmin(user)) notFound()
  return (
    <>
      <h1>Dados de exemplo</h1>
      {loja.slug === SLUG_EXEMPLO ? (
        <ImportarExemplo />
      ) : (
        <p>Escolha a Cantina Dona Lurdes no topo da página para importar os dados de exemplo.</p>
      )}
    </>
  )
}
