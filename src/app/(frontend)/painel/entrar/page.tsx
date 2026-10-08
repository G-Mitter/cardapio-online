import type { Metadata } from 'next'

import { Formulario } from '@/components/painel/Formulario'

import { entrar, sair } from '../actions'

export const metadata: Metadata = { title: 'Entrar' }

export default async function Entrar({ searchParams }: { searchParams: Promise<{ 'sem-loja'?: string }> }) {
  // Logado, mas sem nenhuma loja ligada ao usuário (você ainda não vinculou no /admin).
  if ((await searchParams)['sem-loja']) {
    return (
      <main className="entrar">
        <h1>Nenhuma loja vinculada</h1>
        <p>Seu usuário ainda não está ligado a uma loja. Fale com quem te passou o acesso.</p>
        <form action={sair}>
          <button className="botao secundario">Sair</button>
        </form>
      </main>
    )
  }

  return (
    <main className="entrar">
      <h1>Painel da loja</h1>
      <p>Entre para cuidar do seu cardápio e dos pedidos.</p>
      <Formulario acao={entrar}>
        <label className="campo">
          E-mail ou usuário
          <input name="login" autoComplete="username" autoCapitalize="none" required />
        </label>
        <label className="campo">
          Senha
          <input type="password" name="senha" autoComplete="current-password" required />
        </label>
        <button className="botao">Entrar</button>
      </Formulario>
    </main>
  )
}
