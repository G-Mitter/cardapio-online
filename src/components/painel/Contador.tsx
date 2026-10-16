'use client'

import { useId, useState } from 'react'

/**
 * Número inteiro com botões − e +: funciona no celular, onde as setinhas do campo numérico não aparecem.
 * Com `name`, vai junto no formulário; com `aoMudar`, avisa o valor a cada mudança.
 */
export function Contador({
  rotulo,
  inicial,
  min = 0,
  max = 999,
  name,
  aoMudar,
}: {
  rotulo: string
  inicial: number
  min?: number
  max?: number
  name?: string
  aoMudar?: (valor: number) => void
}) {
  const id = useId()
  const [texto, setTexto] = useState(String(inicial))
  const valor = Math.min(max, Math.max(min, Number(texto) || min))

  function mudar(novo: number) {
    const v = Math.min(max, Math.max(min, novo))
    setTexto(String(v))
    aoMudar?.(v)
  }

  return (
    <div className="campo curto">
      <label htmlFor={id}>{rotulo}</label>
      <div className="contador">
        <button
          type="button"
          className="botao secundario"
          aria-label={`Diminuir ${rotulo.toLowerCase()}`}
          disabled={valor <= min}
          onClick={() => mudar(valor - 1)}
        >
          −
        </button>
        <input
          id={id}
          name={name}
          inputMode="numeric"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value.replace(/\D/g, '').slice(0, 3))
            aoMudar?.(
              Math.min(max, Math.max(min, Number(e.target.value.replace(/\D/g, '')) || min)),
            )
          }}
          onBlur={() => setTexto(String(valor))}
          autoComplete="off"
        />
        <button
          type="button"
          className="botao secundario"
          aria-label={`Aumentar ${rotulo.toLowerCase()}`}
          disabled={valor >= max}
          onClick={() => mudar(valor + 1)}
        >
          +
        </button>
      </div>
    </div>
  )
}
