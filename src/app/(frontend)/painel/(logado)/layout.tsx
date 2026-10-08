import { Menu } from '@/components/painel/Menu'
import { sessao } from '@/lib/painel'

import { sair, trocarLoja } from '../actions'

const MENU = [
  ['/painel', 'Pedidos'],
  ['/painel/produtos', 'Produtos'],
  ['/painel/categorias', 'Categorias'],
  ['/painel/cupons', 'Cupons'],
  ['/painel/loja', 'Minha loja'],
  ['/painel/importar', 'Importar planilha'],
] as const

/** Moldura das telas do painel: nome da loja, menu e sair. Sem login, `sessao` manda para /painel/entrar. */
export default async function LayoutLogado({ children }: { children: React.ReactNode }) {
  const { loja, lojas } = await sessao()

  return (
    <>
      <header className="topo">
        <div className="topo__loja">
          {lojas.length > 1 ? (
            <form action={trocarLoja} className="trocar">
              <select name="loja" defaultValue={loja.id} aria-label="Loja">
                {lojas.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nome}
                  </option>
                ))}
              </select>
              <button className="botao secundario">Trocar</button>
            </form>
          ) : (
            <b>{loja.nome}</b>
          )}
          <a href={`/${loja.slug}`} target="_blank" rel="noreferrer">
            Ver meu cardápio ↗
          </a>
        </div>
        <nav aria-label="Painel">
          <Menu itens={MENU} />
          <form action={sair}>
            <button className="sair">Sair</button>
          </form>
        </nav>
      </header>
      <main className="conteudo">{children}</main>
    </>
  )
}
