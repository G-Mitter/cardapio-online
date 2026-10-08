'use client'

export function Imprimir() {
  return (
    <button type="button" className="botao" onClick={() => window.print()}>
      Imprimir
    </button>
  )
}
