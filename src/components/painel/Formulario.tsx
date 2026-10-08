'use client'

import { useState, useTransition, type ReactNode } from 'react'

import type { Estado } from '@/app/(frontend)/painel/actions'

/**
 * Formulário do painel: envia para uma ação do servidor e mostra o erro, se houver.
 * Usa onSubmit (e não action=) porque o React apaga os campos depois de um action=,
 * e o dono perderia o que digitou quando der erro.
 */
export function Formulario({
  acao,
  children,
  className = 'form',
}: {
  acao: (estado: Estado, form: FormData) => Promise<Estado>
  children: ReactNode
  className?: string
}) {
  const [estado, setEstado] = useState<Estado>(null)
  const [enviando, startTransition] = useTransition()

  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault()
        const dados = new FormData(e.currentTarget)
        startTransition(async () => setEstado(await acao(null, dados)))
      }}
    >
      <fieldset disabled={enviando}>{children}</fieldset>
      {estado?.erro && (
        <p role="alert" className="erro">
          {estado.erro}
        </p>
      )}
    </form>
  )
}
