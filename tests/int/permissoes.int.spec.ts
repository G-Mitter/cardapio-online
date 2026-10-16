import { describe, expect, it } from 'vitest'

import { contido, efetivas, gerentes, lerPermissoes, PAPEIS, primeiraTela, SEM_EXCLUIR, telasDoUsuario, temPermissao } from '@/lib/permissoes'

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
    expect(telasDoUsuario(cardapio).map(([h]) => h)).toEqual(['/painel/produtos', '/painel/categorias', '/painel/cupons', '/painel/estoque'])
    expect(primeiraTela(cardapio)).toBe('/painel/produtos')
    expect(primeiraTela({ roles: ['loja'], permissoes: [] })).toBe('/painel/sem-acesso')
  })

  it('lê só permissões que existem', () => {
    expect(lerPermissoes(['pedidos', 'xx', 'pedidos', 'excluir'])).toEqual(['pedidos', 'excluir'])
    expect(lerPermissoes('pedidos')).toEqual([])
    expect(SEM_EXCLUIR.erro).toMatch(/apagar/)
  })
})

describe('usuários', () => {
  it('efetivas: tudo para o administrador e para quem não tem lista', () => {
    expect(efetivas({ roles: ['loja'] })).toHaveLength(7)
    expect(efetivas({ roles: ['admin'], permissoes: [] })).toHaveLength(7)
    expect(efetivas({ roles: ['loja'], permissoes: ['pedidos', 'x'] })).toEqual(['pedidos'])
  })

  it('só dá e só mexe no que está contido nas próprias permissões', () => {
    expect(contido(['pedidos'], ['pedidos', 'financeiro'])).toBe(true)
    expect(contido(['pedidos', 'excluir'], ['pedidos', 'financeiro'])).toBe(false)
    expect(contido([], [])).toBe(true)
  })

  it('os atalhos só usam permissões que existem; Gerente é tudo', () => {
    for (const p of PAPEIS) expect(lerPermissoes(p.permissoes)).toEqual(p.permissoes)
    expect(PAPEIS[0].permissoes).toHaveLength(7)
  })

  it('conta os gerentes ativos (desligado e sem a permissão não contam)', () => {
    const u = (ativo: boolean, permissoes: string[] | null) => ({ ativo, roles: ['loja'], permissoes })
    expect(gerentes([u(true, ['usuarios']), u(false, ['usuarios']), u(true, ['pedidos']), u(true, null)])).toBe(2)
    expect(gerentes([u(false, null)])).toBe(0)
  })
})
