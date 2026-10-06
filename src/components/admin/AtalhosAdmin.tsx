import Link from 'next/link'
import type { Payload, TypedUser } from 'payload'

import { ehAdmin } from '@/access/roles'

/**
 * Atalhos no menu lateral do /admin. O dono da loja vê um menu enxuto:
 * Pedidos, Produtos, Categorias, Minha loja e Ver meu cardápio.
 */
export async function AtalhosAdmin({ user, payload }: { user?: TypedUser; payload: Payload }) {
  const dono = user && !ehAdmin(user)
  const lojaId = dono ? user.tenants?.[0]?.tenant : undefined
  const loja = lojaId
    ? typeof lojaId === 'object'
      ? lojaId
      : await payload.findByID({ collection: 'lojas', id: lojaId, depth: 0 })
    : null

  return (
    <>
      {/* Lojas e Imagens continuam funcionando (a foto do produto usa Imagens), só saem do menu. */}
      {dono && <style>{'#nav-lojas, #nav-media { display: none }'}</style>}
      <Link href="/admin/pedidos-de-hoje" className="nav__link">
        <span className="nav__link-label">Pedidos de hoje</span>
      </Link>
      <Link href="/admin/importar" className="nav__link">
        <span className="nav__link-label">Importar planilha</span>
      </Link>
      {loja && (
        <>
          <Link href={`/admin/collections/lojas/${loja.id}`} className="nav__link">
            <span className="nav__link-label">Minha loja</span>
          </Link>
          <a
            href={`/${loja.slug}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn--style-primary ver-cardapio"
          >
            Ver meu cardápio
          </a>
        </>
      )}
    </>
  )
}
