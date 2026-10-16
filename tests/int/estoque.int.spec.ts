import { describe, expect, it } from 'vitest'

import { lerQuantidade, rotuloQuantidade, situacao, somar } from '@/lib/estoque'

describe('estoque', () => {
  it('lê quantidades de vários jeitos', () => {
    expect(lerQuantidade('10')).toBe(10)
    expect(lerQuantidade('2,5')).toBe(2.5)
    expect(lerQuantidade('0.250')).toBe(0.25)
    expect(lerQuantidade('1.250,5')).toBe(1250.5)
    expect(lerQuantidade('-2')).toBeNull()
    expect(lerQuantidade('-2', { negativo: true })).toBe(-2)
    expect(lerQuantidade('1,2345')).toBeNull()
    expect(lerQuantidade('abc')).toBeNull()
    expect(lerQuantidade('')).toBeNull()
  })

  it('soma sem sobra de ponto flutuante', () => {
    expect(somar(0.1, 0.2)).toBe(0.3)
    expect(somar(1, -2.5)).toBe(-1.5)
  })

  it('diz quando está acabando ou acabou', () => {
    expect(situacao(5, 2)).toBe('ok')
    expect(situacao(2, 2)).toBe('baixo')
    expect(situacao(0.5, 0)).toBe('ok') // sem mínimo definido, só avisa quando zera
    expect(situacao(0, 0)).toBe('acabou')
    expect(situacao(-3, 2)).toBe('acabou')
  })

  it('escreve a quantidade com vírgula', () => {
    expect(rotuloQuantidade(2.5, 'kg')).toBe('2,5 kg')
  })
})
