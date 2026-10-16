import type { Metadata } from 'next'
import Link from 'next/link'

import { sessaoGarcom } from '@/lib/painel'
import { primeiraTela } from '@/lib/permissoes'

export const metadata: Metadata = { title: 'Sem acesso' }

/** Para onde vai quem tenta uma área que o seu usuário não pode usar. */
export default async function SemAcesso() {
  const { user } = await sessaoGarcom(null)
  const destino = primeiraTela(user)
  return (
    <>
      <h1>Você não tem acesso a esta área</h1>
      <p>
        Seu usuário não tem permissão para isso. Peça a quem cuida dos usuários da loja para liberar, se precisar.
      </p>
      {destino !== '/painel/sem-acesso' && (
        <Link href={destino} className="botao">
          Voltar ao painel
        </Link>
      )}
    </>
  )
}
