'use client'

import { useId, useState } from 'react'

import { mascararTelefone } from '@/lib/mascaras'

/** Telefone com DDD: a pessoa digita só os números e o campo escreve "(31) 99999-0000". */
export function CampoTelefone({
  rotulo,
  name,
  inicial = '',
  required,
  aoMudar,
}: {
  rotulo: string
  name: string
  inicial?: string
  required?: boolean
  aoMudar?: (telefone: string) => void
}) {
  const id = useId()
  const [valor, setValor] = useState(mascararTelefone(inicial))
  return (
    <div className="campo">
      <label htmlFor={id}>{rotulo}</label>
      <input
        id={id}
        name={name}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="(31) 99999-0000"
        required={required}
        value={valor}
        onChange={(e) => {
          const v = mascararTelefone(e.target.value)
          setValor(v)
          aoMudar?.(v)
        }}
      />
    </div>
  )
}
