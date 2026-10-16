import { describe, expect, it } from 'vitest'

import { loginDoGarcom } from '@/lib/garcom'

describe('loginDoGarcom', () => {
  it('completa com o final da loja', () => {
    expect(loginDoGarcom('Maria', 'cantina')).toBe('maria.cantina')
  })
  it('não repete o final se já veio completo', () => {
    expect(loginDoGarcom('maria.cantina', 'cantina')).toBe('maria.cantina')
  })
})
