import Link from 'next/link'

/** Atalho no menu lateral do /admin para a tela de importação. */
export function LinkImportar() {
  return (
    <Link href="/admin/importar" className="nav__link">
      <span className="nav__link-label">Importar planilha</span>
    </Link>
  )
}
