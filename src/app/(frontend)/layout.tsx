import { Archivo, Bitter, Fraunces, Outfit } from 'next/font/google'
import type { Metadata } from 'next'
import React from 'react'

import './styles.css'

/**
 * next/font baixa as fontes do Google no build e serve junto com o site.
 * Cada fonte vira uma variável CSS. A loja escolhe no /admin qual delas
 * vai nos títulos (ver src/lib/tema.ts); o texto corrido usa sempre a Outfit.
 */
const classica = Fraunces({ subsets: ['latin'], variable: '--font-classica' })
const moderna = Archivo({ subsets: ['latin'], variable: '--font-moderna' })
const tradicional = Bitter({ subsets: ['latin'], variable: '--font-tradicional' })
const leve = Outfit({ subsets: ['latin'], variable: '--font-leve' })

export const metadata: Metadata = {
  title: { default: 'Cardápio online', template: '%s · Cardápio online' },
  description: 'Faça seu pedido pelo cardápio e envie direto no WhatsApp da loja.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontes = [classica, moderna, tradicional, leve].map((f) => f.variable).join(' ')
  return (
    <html lang="pt-BR" className={fontes}>
      <body>{children}</body>
    </html>
  )
}
