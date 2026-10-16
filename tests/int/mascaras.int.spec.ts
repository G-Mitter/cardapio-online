import { describe, expect, it } from 'vitest'

import { lerPreco } from '@/lib/planilha'
import { centavosDoTexto, dinheiroDeCentavos, mascararTelefone } from '@/lib/mascaras'

describe('dinheiro', () => {
  it('digitar só números preenche da direita para a esquerda', () => {
    expect(dinheiroDeCentavos(centavosDoTexto('5'))).toBe('0,05')
    expect(dinheiroDeCentavos(centavosDoTexto('0,05' + '0'))).toBe('0,50')
    expect(dinheiroDeCentavos(centavosDoTexto('125030'))).toBe('1.250,30')
  })
  it('o texto da máscara é lido pelo servidor', () => {
    expect(lerPreco(dinheiroDeCentavos(125030))).toBe(1250.3)
    expect(lerPreco(dinheiroDeCentavos(0))).toBe(0)
  })
})

describe('telefone', () => {
  it('põe DDD e hífen enquanto digita', () => {
    expect(mascararTelefone('3')).toBe('(3')
    expect(mascararTelefone('31')).toBe('(31')
    expect(mascararTelefone('319')).toBe('(31) 9')
    expect(mascararTelefone('3199999000')).toBe('(31) 9999-9000')
    expect(mascararTelefone('31999990000')).toBe('(31) 99999-0000')
    expect(mascararTelefone('(31) 99999-0000 extra 99')).toBe('(31) 99999-0000')
  })
})
