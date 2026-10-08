'use client'

import { useState } from 'react'

/**
 * Campo de texto com formato próprio (bairros, opções do produto) e um botão que cola o
 * exemplo no campo: a loja só edita os nomes e valores em vez de escrever tudo do zero.
 */
export function CampoComExemplo({
  name,
  rotulo,
  exemplo,
  defaultValue = '',
  rows = 5,
  aoMudar,
  children,
}: {
  name: string
  rotulo: string
  exemplo: string
  defaultValue?: string
  rows?: number
  /** Para quem precisa do texto fora do campo (a prévia da loja). */
  aoMudar?: (texto: string) => void
  /** Explicação do formato, abaixo do campo. */
  children?: React.ReactNode
}) {
  const [texto, setTexto] = useState(defaultValue)
  const mudar = (novo: string) => {
    setTexto(novo)
    aoMudar?.(novo)
  }

  return (
    <div className="campo">
      <label htmlFor={`campo-${name}`}>{rotulo}</label>
      <textarea
        id={`campo-${name}`}
        name={name}
        rows={rows}
        value={texto}
        onChange={(e) => mudar(e.target.value)}
        placeholder={exemplo}
      />
      {!texto.trim() && (
        <button type="button" className="botao secundario" onClick={() => mudar(exemplo)}>
          Colar exemplo
        </button>
      )}
      <small>{children}</small>
    </div>
  )
}
