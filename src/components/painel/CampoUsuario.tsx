'use client'

import { useId, useState } from 'react'

/** Usuário do garçom: só letras minúsculas, números, _ e -, e mostra o login completo que ele vai usar. */
export function CampoUsuario({ slug, quem = 'O garçom', obrigatorio = true }: { slug: string; quem?: string; obrigatorio?: boolean }) {
  const id = useId()
  const [usuario, setUsuario] = useState('')
  return (
    <div className="campo">
      <label htmlFor={id}>Usuário</label>
      <input
        id={id}
        name="usuario"
        required={obrigatorio}
        minLength={3}
        maxLength={20}
        autoCapitalize="none"
        autoComplete="off"
        placeholder="maria"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
      />
      <small>
        {quem} entra com <b>{usuario || 'usuario'}.{slug}</b>
      </small>
    </div>
  )
}
