/**
 * Clientes de uma loja, vistos pelos pedidos dela, sem banco e sem tela: dá para testar sozinho.
 * A chave é o telefone (só DDD + número). Pedido cancelado e pedido sem telefone não contam.
 */
import { normalizarTelefone } from './cliente'

export type PedidoDeCliente = { nome: string; telefone?: string | null; total: number; status: string; createdAt: string }

export type ClienteDaLoja = { telefone: string; nome: string; pedidos: number; total: number; ultimo: string }

const c = (v: number) => Math.round(v * 100)
const DIA = 24 * 60 * 60 * 1000

/** Junta os pedidos por telefone. O nome é o do pedido mais recente; mais recentes primeiro. */
export function agruparClientes(pedidos: PedidoDeCliente[]): ClienteDaLoja[] {
  const porTelefone = new Map<string, ClienteDaLoja & { centavos: number }>()
  for (const p of pedidos) {
    const telefone = normalizarTelefone(p.telefone)
    if (!telefone || p.status === 'cancelado') continue
    const x = porTelefone.get(telefone)
    const maisNovo = !x || p.createdAt > x.ultimo
    porTelefone.set(telefone, {
      telefone,
      nome: maisNovo ? p.nome : x.nome,
      pedidos: (x?.pedidos ?? 0) + 1,
      centavos: (x?.centavos ?? 0) + c(p.total),
      total: 0,
      ultimo: maisNovo ? p.createdAt : x.ultimo,
    })
  }
  return [...porTelefone.values()]
    .map(({ centavos, ...cli }) => ({ ...cli, total: centavos / 100 }))
    .sort((a, b) => b.ultimo.localeCompare(a.ultimo))
}

export const diasSemPedir = (ultimo: string, agora = new Date()) =>
  Math.max(0, Math.floor((agora.getTime() - new Date(ultimo).getTime()) / DIA))

/** Busca por nome ou telefone; "sumiu" = sem pedir há N dias ou mais; "mínimo" = pelo menos N pedidos. */
export function filtrarClientes(
  clientes: ClienteDaLoja[],
  f: { busca?: string; semPedirHa?: number; minimoDePedidos?: number },
  agora = new Date(),
): ClienteDaLoja[] {
  const semAcento = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  const termo = semAcento(f.busca ?? '').trim()
  const digitos = termo.replace(/\D/g, '')
  return clientes.filter(
    (x) =>
      (!termo || semAcento(x.nome).includes(termo) || (digitos.length > 0 && x.telefone.includes(digitos))) &&
      (!f.semPedirHa || diasSemPedir(x.ultimo, agora) >= f.semPedirHa) &&
      (!f.minimoDePedidos || x.pedidos >= f.minimoDePedidos),
  )
}

/** Número inteiro positivo vindo da URL; qualquer outra coisa vira indefinido. */
export const lerInteiro = (v: unknown): number | undefined => {
  const n = Number(v)
  return Number.isInteger(n) && n > 0 && n <= 9999 ? n : undefined
}
