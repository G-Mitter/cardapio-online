import Link from 'next/link'

/** Atalhos no menu lateral do /admin para as telas feitas para o dono da loja. */
export function AtalhosAdmin() {
  return (
    <>
      <Link href="/admin/pedidos-de-hoje" className="nav__link">
        <span className="nav__link-label">Pedidos de hoje</span>
      </Link>
      <Link href="/admin/importar" className="nav__link">
        <span className="nav__link-label">Importar planilha</span>
      </Link>
    </>
  )
}
