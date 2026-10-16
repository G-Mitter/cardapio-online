/**
 * O que cada usuário da loja pode fazer no painel, sem banco e sem tela.
 * A lista fica guardada em `users.permissoes` (JSON). Sem lista (usuários de antes, ou nunca definida)
 * vale tudo, e o administrador geral sempre pode tudo.
 */

export const PERMISSOES = [
  { valor: 'pedidos', rotulo: 'Mexer nos pedidos', ajuda: 'Pedidos, cozinha, mesas, novo pedido e carrinhos abandonados' },
  { valor: 'financeiro', rotulo: 'Ver o financeiro', ajuda: 'Contas a pagar e a receber, dar baixa e conferir a maquininha' },
  { valor: 'cardapio', rotulo: 'Editar o cardápio', ajuda: 'Produtos, categorias e cupons' },
  { valor: 'loja', rotulo: 'Editar a loja', ajuda: 'Dados, taxas, mesas, QR Codes e importar planilha' },
  { valor: 'equipe', rotulo: 'Cuidar da equipe', ajuda: 'Entregadores, acerto e garçons' },
  { valor: 'usuarios', rotulo: 'Criar e gerenciar usuários', ajuda: 'Quem entra no painel e o que cada um pode' },
  { valor: 'excluir', rotulo: 'Excluir', ajuda: 'Apagar produtos, categorias, cupons, lançamentos e carrinhos' },
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
  ['/painel/entregadores', 'Entregadores', 'equipe'],
  ['/painel/garcons', 'Garçons', 'equipe'],
  ['/painel/produtos', 'Produtos', 'cardapio'],
  ['/painel/categorias', 'Categorias', 'cardapio'],
  ['/painel/cupons', 'Cupons', 'cardapio'],
  ['/painel/carrinhos', 'Carrinhos', 'pedidos'],
  ['/painel/financeiro', 'Financeiro', 'financeiro'],
  ['/painel/loja', 'Minha loja', 'loja'],
  ['/painel/importar', 'Importar planilha', 'loja'],
] as const satisfies readonly (readonly [string, string, Permissao])[]

export const telasDoUsuario = (user: Usuario) => TELAS.filter(([, , p]) => temPermissao(user, p))

/** Para onde mandar quem não pode ver a tela inicial (Pedidos). */
export const primeiraTela = (user: Usuario): string => telasDoUsuario(user)[0]?.[0] ?? '/painel/sem-acesso'

/** Resposta das ações de apagar quando falta "excluir". */
export const SEM_EXCLUIR = { erro: 'Você não tem permissão para apagar.' } as const
