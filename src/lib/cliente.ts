/**
 * Regras do cadastro do cliente final, sem banco e sem tela: dá para testar sozinhas.
 * O telefone é a "chave" do cadastro, que vale em todas as lojas do sistema.
 */

export type Endereco = { rua: string; complemento?: string | null; bairro: string }

/**
 * Telefone só com DDD + número (10 ou 11 dígitos), sem o 55.
 * "(31) 99999-0000", "+55 31 99999-0000" e "31999990000" viram "31999990000".
 */
export function normalizarTelefone(valor: string | null | undefined): string | null {
  let d = (valor ?? '').replace(/\D/g, '')
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) d = d.slice(2)
  return d.length === 10 || d.length === 11 ? d : null
}

export const primeiroNome = (nome: string) => nome.trim().split(/\s+/)[0] ?? ''

/**
 * Endereço escondido, para mostrar a quem digitou um telefone já cadastrado sem
 * confirmar que o número é dele: o começo da rua e o número, o suficiente para o
 * dono reconhecer. "Rua dos Timbiras, 1200, ap 301" vira "Rua dos Ti…, 1200".
 */
export function mascararEndereco(e: Endereco): string {
  const rua = e.rua.trim()
  const numero = rua.match(/(\d+)\D*$/)?.[1]
  const inicio = rua.length > 10 ? `${rua.slice(0, 10).trimEnd()}…` : rua
  return numero && !inicio.includes(numero) ? `${inicio}, ${numero}` : inicio
}

/** Endereço completo, como vai para a loja no pedido. */
export const enderecoCompleto = (e: Endereco) =>
  [e.rua, e.complemento, e.bairro].map((p) => p?.trim()).filter(Boolean).join(', ')
