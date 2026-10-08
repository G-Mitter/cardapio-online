'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/** Menu do painel, com a tela atual marcada. */
export function Menu({ itens }: { itens: readonly (readonly [string, string])[] }) {
  const atual = usePathname()
  return itens.map(([href, rotulo]) => {
    const ativo = href === '/painel' ? atual === href : atual.startsWith(href)
    return (
      <Link key={href} href={href} aria-current={ativo ? 'page' : undefined}>
        {rotulo}
      </Link>
    )
  })
}
