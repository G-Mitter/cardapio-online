'use client'

import { useId, useState } from 'react'

import { centavosDoTexto, dinheiroDeCentavos } from '@/lib/mascaras'

/**
 * Valor em reais com máscara: a pessoa digita só os números ("1250" vira "12,50") e o campo mostra
 * o formato certo. Vai no formulário como "1.250,30", que o servidor já sabe ler.
 */
export function CampoDinheiro({
  rotulo,
  name,
  inicial = 0,
  aoMudar,
  curto,
  semRotulo,
}: {
  rotulo: string
  name?: string
  /** Em reais. */
  inicial?: number
  /** Valor em reais a cada mudança. */
  aoMudar?: (reais: number) => void
  curto?: boolean
  /** Para linhas de lista, onde o rótulo vai só para o leitor de tela. */
  semRotulo?: boolean
}) {
  const id = useId()
  const [centavos, setCentavos] = useState(Math.round(inicial * 100))
  const campo = (
    <input
      id={id}
      name={name}
      inputMode="numeric"
      autoComplete="off"
      value={dinheiroDeCentavos(centavos)}
      onChange={(e) => {
        const c = centavosDoTexto(e.target.value)
        setCentavos(c)
        aoMudar?.(c / 100)
      }}
      aria-label={semRotulo ? rotulo : undefined}
    />
  )
  if (semRotulo) return campo
  return (
    <div className={curto ? 'campo curto' : 'campo'}>
      <label htmlFor={id}>{rotulo}</label>
      {campo}
    </div>
  )
}
