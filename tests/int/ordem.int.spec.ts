import { describe, expect, it } from 'vitest'

import { mover } from '@/lib/ordem'

describe('mover', () => {
  it('troca com o vizinho', () => {
    expect(mover([1, 2, 3], 2, -1)).toEqual([2, 1, 3])
    expect(mover([1, 2, 3], 2, 1)).toEqual([1, 3, 2])
  })
  it('não passa das pontas nem aceita id desconhecido', () => {
    expect(mover([1, 2, 3], 1, -1)).toBeNull()
    expect(mover([1, 2, 3], 3, 1)).toBeNull()
    expect(mover([1, 2, 3], 9, 1)).toBeNull()
  })
})
