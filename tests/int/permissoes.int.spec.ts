import { describe, expect, it } from 'vitest'

import { lerPermissoes, primeiraTela, SEM_EXCLUIR, telasDoUsuario, temPermissao } from '@/lib/permissoes'

describe('permissões', () => {
  it('sem lista (usuário de antes) e administrador podem tudo', () => {
    expect(temPermissao({ roles: ['loja'] }, 'financeiro')).toBe(true)
    expect(temPermissao({ roles: ['loja'], permissoes: null }, 'excluir')).toBe(true)
    expect(temPermissao({ roles: ['admin'], permissoes: [] }, 'excluir')).toBe(true)
  })

  it('com lista, só o que está nela (lista vazia não pode nada)', () => {
    const caixa = { roles: ['loja'], permissoes: ['pedidos', 'financeiro'] }
    expect(temPermissao(caixa, 'financeiro')).toBe(true)
    expect(temPermissao(caixa, 'cardapio')).toBe(false)
    expect(temPermissao({ roles: ['loja'], permissoes: [] }, 'pedidos')).toBe(false)
    expect(temPermissao(null, 'pedidos')).toBe(false)
  })

  it('o menu mostra só o que pode, e a entrada cai na primeira tela permitida', () => {
    const cardapio = { roles: ['loja'], permissoes: ['cardapio'] }
    expect(telasDoUsuario(cardapio).map(([h]) => h)).toEqual(['/painel/produtos', '/painel/categorias', '/painel/cupons'])
    expect(primeiraTela(cardapio)).toBe('/painel/produtos')
    expect(primeiraTela({ roles: ['loja'], permissoes: [] })).toBe('/painel/sem-acesso')
  })

  it('lê só permissões que existem', () => {
    expect(lerPermissoes(['pedidos', 'xx', 'pedidos', 'excluir'])).toEqual(['pedidos', 'excluir'])
    expect(lerPermissoes('pedidos')).toEqual([])
    expect(SEM_EXCLUIR.erro).toMatch(/apagar/)
  })
})
