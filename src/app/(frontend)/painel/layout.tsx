import type { Metadata } from 'next'

import './painel.css'

export const metadata: Metadata = {
  title: { default: 'Painel da loja', template: '%s · Painel da loja' },
  robots: { index: false },
}

export default function LayoutPainel({ children }: { children: React.ReactNode }) {
  return <div className="painel">{children}</div>
}
