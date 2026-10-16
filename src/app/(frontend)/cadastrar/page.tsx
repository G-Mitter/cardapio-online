import type { Metadata } from 'next'
import Link from 'next/link'

import { FormCadastro } from '@/components/FormCadastro'

import '../painel/painel.css'

export const metadata: Metadata = {
  title: 'Criar minha loja',
  description: 'Cadastre a sua loja e monte o cardápio online.',
}

/** Cadastro feito pelo próprio cliente, a partir da página inicial. Preço e pagamento ainda não entram. */
export default function Cadastrar() {
  return (
    <div className="painel">
      <main className="entrar">
        <h1>Criar minha loja</h1>
        <p>Preencha os dados abaixo. Depois você completa o cardápio no painel.</p>
        <FormCadastro />
        <p>
          Já tem cadastro? <Link href="/painel/entrar">Entrar no painel</Link>
        </p>
      </main>
    </div>
  )
}
