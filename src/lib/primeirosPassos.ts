import type { Permissao } from './permissoes'

/**
 * Lista de "primeiros passos" na tela inicial do painel de uma loja recém-criada.
 * Cada passo se marca sozinho a partir do que a loja já salvou. Sem banco e sem tela, para testar.
 */

export type PassoPainel = {
  href: string
  rotulo: string
  feito: boolean
  /** Quem não tem esta permissão não vê o passo (o link levaria a "sem acesso"). */
  permissao: Permissao
}

export type DadosDaLoja = {
  endereco?: string | null
  horario?: string | null
  logo?: unknown
  fazEntrega?: boolean | null
  taxaEntrega?: number | null
  bairros?: unknown[] | null
  formasPagamento?: string[] | null
  chavePix?: string | null
}

export function primeirosPassos(loja: DadosDaLoja, produtos: number): PassoPainel[] {
  const formas = loja.formasPagamento ?? []
  return [
    { href: '/painel/loja', rotulo: 'Endereço e horário da loja', feito: Boolean(loja.endereco && loja.horario), permissao: 'loja' },
    { href: '/painel/loja', rotulo: 'Logo da loja', feito: Boolean(loja.logo), permissao: 'loja' },
    {
      href: '/painel/loja',
      rotulo: 'Entrega e taxa',
      // ponytail: a taxa padrão é 0; quem entrega de graça não marca este passo sozinho, e dispensa a lista.
      feito: !loja.fazEntrega || (loja.taxaEntrega ?? 0) > 0 || (loja.bairros?.length ?? 0) > 0,
      permissao: 'loja',
    },
    {
      href: '/painel/loja',
      rotulo: 'Formas de pagamento e chave Pix',
      feito: formas.length > 0 && (!formas.includes('pix') || Boolean(loja.chavePix)),
      permissao: 'loja',
    },
    { href: '/painel/produtos', rotulo: 'Cadastrar os primeiros produtos', feito: produtos > 0, permissao: 'cardapio' },
  ]
}
