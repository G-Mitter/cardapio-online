'use server'

/**
 * Cadastro do cliente final pelo telefone. Vale em todas as lojas.
 *
 * Decisão (08/10/2026): sem código de confirmação do telefone. Por isso quem digita
 * um número já cadastrado só vê o primeiro nome e os endereços escondidos
 * (src/lib/cliente.ts); o endereço completo só vai para a loja, dentro do pedido.
 */
import { getPayload, type Payload } from 'payload'

import { type Endereco, mascararEndereco, normalizarTelefone, primeiroNome } from '@/lib/cliente'
import { buscarCliente as buscar } from '@/lib/clientes-db'
import { taxaDoBairro } from '@/lib/entrega'
import type { Cliente, Loja } from '@/payload-types'
import config from '@/payload.config'

/** `taxa`: o que a loja cobra para entregar neste endereço; null se ela não entrega naquele bairro. */
export type EnderecoResumo = { id: string; resumo: string; taxa: number | null }

export type Identificacao =
  | { ok: true; novo: true }
  | { ok: true; novo: false; nome: string; enderecos: EnderecoResumo[] }
  | { ok: false; erro: string }

/** Um cliente não precisa de mais que isso; evita alguém lotar um cadastro. */
const MAX_ENDERECOS = 10

const texto = (v: unknown, max: number) =>
  String(v ?? '')
    .trim()
    .slice(0, max)

function lerEndereco(e: Partial<Endereco> | undefined): Endereco | string {
  const rua = texto(e?.rua, 120)
  const bairro = texto(e?.bairro, 60)
  if (!rua) return 'Coloque a rua e o número.'
  if (!bairro) return 'Coloque o bairro.'
  return { rua, complemento: texto(e?.complemento, 60), bairro }
}

/** O que pode voltar para o navegador: nada de sobrenome, rua completa ou complemento. */
const resumo = (c: Cliente, loja: Loja | undefined): Identificacao => ({
  ok: true,
  novo: false,
  nome: primeiroNome(c.nome),
  enderecos: (c.enderecos ?? []).map((e) => ({
    id: e.id!,
    resumo: mascararEndereco(e),
    taxa: loja ? taxaDoBairro(loja.bairros, e.bairro, loja.taxaEntrega ?? 0) : null,
  })),
})

const buscarLoja = async (payload: Payload, slug: string) =>
  (
    await payload.find({
      collection: 'lojas',
      where: { slug: { equals: texto(slug, 100) } },
      limit: 1,
      depth: 0,
    })
  ).docs[0]

export async function identificarCliente(telefone: string, loja: string): Promise<Identificacao> {
  const tel = normalizarTelefone(telefone)
  if (!tel) return { ok: false, erro: 'Telefone incompleto. Coloque o DDD e o número.' }
  // ponytail: sem limite de consultas por IP; se alguém usar para varrer telefones, limitar aqui.
  const payload = await getPayload({ config })
  const cliente = await buscar(payload, tel)
  return cliente ? resumo(cliente, await buscarLoja(payload, loja)) : { ok: true, novo: true }
}

export async function cadastrarCliente(dados: {
  telefone: string
  loja: string
  nome: string
  endereco?: Partial<Endereco>
  /** "Li e aceito os termos e a privacidade" marcado (LGPD). */
  aceite: boolean
}): Promise<Identificacao> {
  const tel = normalizarTelefone(dados.telefone)
  const nome = texto(dados.nome, 80)
  if (!tel) return { ok: false, erro: 'Telefone incompleto. Coloque o DDD e o número.' }
  if (!nome) return { ok: false, erro: 'Coloque seu nome.' }
  if (dados.aceite !== true)
    return { ok: false, erro: 'Para criar o cadastro, aceite os termos e a privacidade.' }
  // Endereço é opcional (quem só retira não precisa); se veio, precisa estar completo.
  const endereco = dados.endereco ? lerEndereco(dados.endereco) : null
  if (typeof endereco === 'string') return { ok: false, erro: endereco }

  const payload = await getPayload({ config })
  if (await buscar(payload, tel)) return { ok: false, erro: 'Este telefone já tem cadastro.' }
  const cliente = await payload.create({
    collection: 'clientes',
    data: {
      telefone: tel,
      nome,
      enderecos: endereco ? [endereco] : [],
      aceitouEm: new Date().toISOString(),
    },
    overrideAccess: true,
  })
  return resumo(cliente, await buscarLoja(payload, dados.loja))
}

export async function adicionarEndereco(
  telefone: string,
  dados: Partial<Endereco>,
  loja: string,
): Promise<Identificacao> {
  const tel = normalizarTelefone(telefone)
  const endereco = lerEndereco(dados)
  if (!tel) return { ok: false, erro: 'Telefone incompleto.' }
  if (typeof endereco === 'string') return { ok: false, erro: endereco }

  const payload = await getPayload({ config })
  const cliente = await buscar(payload, tel)
  if (!cliente) return { ok: false, erro: 'Cadastro não encontrado. Digite o telefone de novo.' }
  const enderecos = cliente.enderecos ?? []
  if (enderecos.length >= MAX_ENDERECOS) return { ok: false, erro: 'Limite de endereços atingido.' }
  const atualizado = await payload.update({
    collection: 'clientes',
    id: cliente.id,
    data: { enderecos: [...enderecos, endereco] },
    overrideAccess: true,
  })
  return resumo(atualizado, await buscarLoja(payload, loja))
}
