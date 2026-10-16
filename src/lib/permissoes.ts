/**
 * O que cada usuário da loja pode fazer no painel, sem banco e sem tela.
 * A lista fica guardada em `users.permissoes` (JSON). Sem lista (usuários de antes, ou nunca definida)
 * vale tudo, e o administrador geral sempre pode tudo.
 */

export const PERMISSOES = [
  { valor: 'pedidos', rotulo: 'Mexer nos pedidos', ajuda: 'Pedidos, cozinha, mesas, novo pedido e carrinhos abandonados' },
  { valor: 'financeiro', rotulo: 'Ver o financeiro', ajuda: 'Caixa do dia, contas a pagar e a receber, dar baixa e conferir a maquininha' },
  { valor: 'cardapio', rotulo: 'Editar o cardápio', ajuda: 'Produtos, categorias, cupons e estoque' },
  { valor: 'loja', rotulo: 'Editar a loja', ajuda: 'Dados, taxas, mesas, QR Codes e importar planilha' },
  { valor: 'equipe', rotulo: 'Cuidar da equipe', ajuda: 'Entregadores, acerto e garçons' },
  { valor: 'usuarios', rotulo: 'Criar e gerenciar usuários', ajuda: 'Quem entra no painel e o que cada um pode' },
  { valor: 'excluir', rotulo: 'Excluir', ajuda: 'Apagar produtos, categorias, cupons, ingredientes, lançamentos e carrinhos' },
] as const

export type Permissao = (typeof PERMISSOES)[number]['valor']

/** Só as permissões que existem, sem repetir (o que vem do formulário ou do banco não é de confiança). */
export const lerPermissoes = (v: unknown): Permissao[] =>
  PERMISSOES.map((p) => p.valor).filter((p) => Array.isArray(v) && v.includes(p))

type Usuario = { roles?: string[] | null; permissoes?: unknown } | null | undefined

/** Pode usar esta área? Administrador e usuário sem lista (de antes) podem tudo. */
export function temPermissao(user: Usuario, permissao: Permissao): boolean {
  if (!user) return false
  if (user.roles?.includes('admin')) return true
  if (!Array.isArray(user.permissoes)) return true
  return user.permissoes.includes(permissao)
}

/** Telas do menu e a permissão de cada uma. */
export const TELAS = [
  ['/painel', 'Pedidos', 'pedidos'],
  ['/painel/cozinha', 'Cozinha', 'pedidos'],
  ['/painel/mesas', 'Mesas', 'pedidos'],
  ['/painel/impressao', 'Impressão', 'pedidos'],
  ['/painel/entregadores', 'Entregadores', 'equipe'],
  ['/painel/garcons', 'Garçons', 'equipe'],
  ['/painel/usuarios', 'Usuários', 'usuarios'],
  ['/painel/produtos', 'Produtos', 'cardapio'],
  ['/painel/categorias', 'Categorias', 'cardapio'],
  ['/painel/cupons', 'Cupons', 'cardapio'],
  ['/painel/estoque', 'Estoque', 'cardapio'],
  ['/painel/carrinhos', 'Carrinhos', 'pedidos'],
  ['/painel/caixa', 'Caixa', 'financeiro'],
  ['/painel/financeiro', 'Financeiro', 'financeiro'],
  ['/painel/loja', 'Minha loja', 'loja'],
  ['/painel/importar', 'Importar planilha', 'loja'],
] as const satisfies readonly (readonly [string, string, Permissao])[]

export const telasDoUsuario = (user: Usuario) => TELAS.filter(([, , p]) => temPermissao(user, p))

/** Para onde mandar quem não pode ver a tela inicial (Pedidos). */
export const primeiraTela = (user: Usuario): string => telasDoUsuario(user)[0]?.[0] ?? '/painel/sem-acesso'

/** Resposta das ações de apagar quando falta "excluir". */
export const SEM_EXCLUIR = { erro: 'Você não tem permissão para apagar.' } as const

const TODAS = PERMISSOES.map((p) => p.valor)

/** O que o usuário pode de fato: tudo (administrador ou sem lista) ou a lista dele. */
export const efetivas = (user: Usuario): Permissao[] =>
  user?.roles?.includes('admin') || !Array.isArray(user?.permissoes) ? [...TODAS] : lerPermissoes(user.permissoes)

/** Atalhos da tela Usuários: marcam várias permissões de uma vez. */
export const PAPEIS: readonly { nome: string; permissoes: readonly Permissao[] }[] = [
  { nome: 'Gerente', permissoes: TODAS },
  { nome: 'Atendente', permissoes: ['pedidos'] },
  { nome: 'Caixa', permissoes: ['pedidos', 'financeiro'] },
  { nome: 'Cozinha', permissoes: ['pedidos'] },
]

/** Tudo o que `a` tem também está em `b`? Vale para "só dá o que tem" e "só mexe em quem tem o mesmo ou menos". */
export const contido = (a: readonly Permissao[], b: readonly Permissao[]) => a.every((p) => b.includes(p))

/** Quantos usuários ativos ainda gerenciam usuários: a loja nunca pode ficar com zero. */
export const gerentes = (usuarios: { ativo?: boolean | null; roles?: string[] | null; permissoes?: unknown }[]) =>
  usuarios.filter((u) => u.ativo !== false && temPermissao(u, 'usuarios')).length
