import type { Metadata } from 'next'

import { Importador } from '@/components/painel/Importador'
import { sessao } from '@/lib/painel'

export const metadata: Metadata = { title: 'Importar planilha' }

export default async function Importar() {
  const { loja } = await sessao()
  return (
    <>
      <h1>Importar planilha</h1>
      <Importador lojas={[{ id: loja.id, nome: loja.nome, slug: loja.slug }]} />
    </>
  )
}
