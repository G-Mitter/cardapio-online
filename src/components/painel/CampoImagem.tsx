'use client'

import { useState } from 'react'

/** Lado maior da foto depois de reduzida: nítida no celular e leve para enviar. */
const LADO_MAX = 1600

/**
 * Fotos de celular têm 3 a 5 MB. Antes de enviar, o navegador reduz para no máximo
 * 1600 px e salva como JPEG (PNG continua PNG, para não perder o fundo transparente de logos).
 */
async function reduzir(arquivo: File): Promise<File> {
  const bitmap = await createImageBitmap(arquivo)
  const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height))
  if (escala === 1 && arquivo.size < 500_000) return arquivo

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * escala)
  canvas.height = Math.round(bitmap.height * escala)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const tipo = arquivo.type === 'image/png' ? 'image/png' : 'image/jpeg'
  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, tipo, 0.85))
  if (!blob) return arquivo
  const nome = arquivo.name.replace(/\.[^.]+$/, tipo === 'image/png' ? '.png' : '.jpg')
  return new File([blob], nome, { type: tipo })
}

/**
 * Campo de foto: mostra a atual, troca por outra (já reduzida) ou remove.
 * `aoMudar` recebe o endereço da imagem nova (ou null) para a prévia da loja.
 */
export function CampoImagem({
  nome,
  rotulo,
  atual,
  aoMudar,
}: {
  nome: string
  rotulo: string
  atual: string | null
  aoMudar?: (url: string | null) => void
}) {
  const [previa, setPrevia] = useState(atual)
  const [remover, setRemover] = useState(false)

  return (
    <div className="campo">
      <span>{rotulo}</span>
      {previa && !remover && (
        // eslint-disable-next-line @next/next/no-img-element -- prévia local (blob:), sem otimização
        <img src={previa} alt="" className="miniatura" />
      )}
      <input
        type="file"
        name={nome}
        accept="image/*"
        aria-label={rotulo}
        onChange={async (e) => {
          const input = e.currentTarget
          const arquivo = input.files?.[0]
          if (!arquivo) return
          const menor = await reduzir(arquivo).catch(() => arquivo)
          // Troca o arquivo do campo pelo reduzido: é ele que vai no formulário.
          const lista = new DataTransfer()
          lista.items.add(menor)
          input.files = lista.files
          const url = URL.createObjectURL(menor)
          setPrevia(url)
          setRemover(false)
          aoMudar?.(url)
        }}
      />
      {atual && (
        <label className="marcar">
          <input
            type="checkbox"
            name={`${nome}-remover`}
            checked={remover}
            onChange={(e) => {
              setRemover(e.target.checked)
              aoMudar?.(e.target.checked ? null : previa)
            }}
          />
          Remover {rotulo.toLowerCase()}
        </label>
      )}
    </div>
  )
}
