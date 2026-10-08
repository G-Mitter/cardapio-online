'use server'

/**
 * Importação de produtos por planilha. Roda no servidor, com o usuário logado
 * no painel: o dono de uma loja só consegue importar para a loja dele.
 *
 * O navegador lê o arquivo e manda só a tabela de textos. Tudo é validado
 * de novo aqui, na prévia e na confirmação.
 */
import { headers } from 'next/headers'
import { getPayload, type Payload } from 'payload'

import { type ErroLinha, lerProdutos, normalizar } from '@/lib/planilha'
import config from '@/payload.config'

type Tabela = (string | number | boolean | null)[][]

export type ItemPrevia = {
  linha: number
  nome: string
  categoria: string
  preco: number
  acao: 'novo' | 'atualiza'
}

export type Previa =
  | { ok: true; itens: ItemPrevia[]; categoriasNovas: string[]; erros: ErroLinha[] }
  | { ok: false; erro: string }

async function contexto(lojaId: number) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) return { erro: 'Entre no painel de novo.' } as const
  // Com overrideAccess: false o plugin de multi-cliente só devolve as lojas do usuário.
  const { docs } = await payload.find({
    collection: 'lojas',
    where: { id: { equals: lojaId } },
    user,
    overrideAccess: false,
    depth: 0,
    limit: 1,
  })
  if (!docs[0]) return { erro: 'Você não tem acesso a esta loja.' } as const
  return { payload, user, loja: docs[0] } as const
}

async function analisar(payload: Payload, lojaId: number, tabela: Tabela) {
  const leitura = lerProdutos(Array.isArray(tabela) ? tabela : [])
  const [categorias, produtos] = await Promise.all([
    payload.find({
      collection: 'categorias',
      where: { loja: { equals: lojaId } },
      limit: 0,
      depth: 0,
    }),
    payload.find({
      collection: 'produtos',
      where: { loja: { equals: lojaId } },
      limit: 0,
      depth: 0,
    }),
  ])
  // Comparamos sem acento e sem diferença de maiúsculas: "Bebidas" e "bebidas" são a mesma categoria.
  const categoriaPorNome = new Map(categorias.docs.map((c) => [normalizar(c.nome), c.id]))
  const produtoPorNome = new Map(produtos.docs.map((p) => [normalizar(p.nome), p.id]))
  const categoriasNovas = [
    ...new Map(
      leitura.produtos
        .filter((p) => !categoriaPorNome.has(normalizar(p.categoria)))
        .map((p) => [normalizar(p.categoria), p.categoria]),
    ).values(),
  ]
  return { leitura, categoriaPorNome, produtoPorNome, categoriasNovas }
}

export async function previaImportacao(lojaId: number, tabela: Tabela): Promise<Previa> {
  const ctx = await contexto(lojaId)
  if ('erro' in ctx) return { ok: false, erro: ctx.erro! }
  const { leitura, produtoPorNome, categoriasNovas } = await analisar(ctx.payload, lojaId, tabela)
  return {
    ok: true,
    categoriasNovas,
    erros: leitura.erros,
    itens: leitura.produtos.map((p) => ({
      linha: p.linha,
      nome: p.nome,
      categoria: p.categoria,
      preco: p.preco,
      acao: produtoPorNome.has(normalizar(p.nome)) ? 'atualiza' : 'novo',
    })),
  }
}

export type Resultado =
  | { ok: true; criados: number; atualizados: number; categorias: number }
  | { ok: false; erro: string }

export async function confirmarImportacao(lojaId: number, tabela: Tabela): Promise<Resultado> {
  const ctx = await contexto(lojaId)
  if ('erro' in ctx) return { ok: false, erro: ctx.erro! }
  const { payload, user } = ctx
  const { leitura, categoriaPorNome, produtoPorNome, categoriasNovas } = await analisar(
    payload,
    lojaId,
    tabela,
  )
  if (!leitura.produtos.length) return { ok: false, erro: 'Nenhum produto válido para importar.' }

  // Gravamos como o usuário logado (overrideAccess: false): as regras de acesso valem aqui também.
  const comoUsuario = { user, overrideAccess: false } as const
  const ordemBase = categoriaPorNome.size
  for (const [i, nome] of categoriasNovas.entries()) {
    const c = await payload.create({
      collection: 'categorias',
      data: { nome, ordem: ordemBase + i, loja: lojaId },
      ...comoUsuario,
    })
    categoriaPorNome.set(normalizar(nome), c.id)
  }

  let criados = 0
  let atualizados = 0
  // ponytail: um produto por vez; ~1000 linhas levam alguns segundos. Trocar por inserção em lote se ficar lento.
  for (const [ordem, p] of leitura.produtos.entries()) {
    const data = {
      nome: p.nome,
      descricao: p.descricao,
      preco: p.preco,
      esgotado: p.esgotado,
      categoria: categoriaPorNome.get(normalizar(p.categoria))!,
    }
    const existente = produtoPorNome.get(normalizar(p.nome))
    if (existente) {
      await payload.update({ collection: 'produtos', id: existente, data, ...comoUsuario })
      atualizados++
    } else {
      await payload.create({
        collection: 'produtos',
        data: { ...data, ordem, loja: lojaId },
        ...comoUsuario,
      })
      criados++
    }
  }
  return { ok: true, criados, atualizados, categorias: categoriasNovas.length }
}
