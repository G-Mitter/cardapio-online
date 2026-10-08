import { describe, expect, it } from 'vitest'

import { textoDoArquivo } from '@/collections/Media'

describe('textoDoArquivo', () => {
  it('vira texto legível a partir do nome do arquivo', () => {
    expect(textoDoArquivo('vaca-atolada.jpg')).toBe('Vaca atolada')
    expect(textoDoArquivo('pao_de_queijo.final.png')).toBe('Pao de queijo.final')
    expect(textoDoArquivo(undefined)).toBe('')
  })
})
