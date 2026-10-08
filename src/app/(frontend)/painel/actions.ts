'use server'

/**
 * Tudo o que o painel da loja grava. Cada ação começa por `sessao()`, que confere o login
 * e a loja; as gravações vão como o usuário logado, e o Payload confere o acesso de novo.
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload, type Payload } from 'payload'

import { COOKIE_LOJA, sessao } from '@/lib/painel'
import { STATUS, type Status } from '@/lib/pedidosDoDia'
import { FORMAS_PAGAMENTO } from '@/lib/pedido'
import { comCidade, linkMaps, MAX_PARADAS } from '@/lib/rota'
import { lerPreco } from '@/lib/planilha'
import type { Loja } from '@/payload-types'
import config from '@/payload.config'

/** Resposta das ações com formulário: uma mensagem de erro para mostrar, ou nada. */
export type Estado = { erro: string } | null

const texto = (form: FormData, campo: string) => String(form.get(campo) ?? '').trim()
const marcado = (form: FormData, campo: string) => form.get(campo) === 'on'

/** Mensagem do Payload ("The following field is invalid: ...") vira algo legível. */
function mensagem(e: unknown): string {
  const dados = (e as { data?: { errors?: { message?: string }[] } })?.data?.errors
  return dados?.map((d) => d.message).filter(Boolean).join(' ') || 'Não foi possível salvar. Tente de novo.'
}

const tokenCookie = (payload: Payload) => `${payload.config.cookiePrefix}-token`

// ---------- Entrar e sair ----------

export async function entrar(_: Estado, form: FormData): Promise<Estado> {
  const payload = await getPayload({ config })
  let resultado
  try {
    resultado = await payload.login({
      collection: 'users',
      data: { email: texto(form, 'email'), password: String(form.get('senha') ?? '') },
    })
  } catch {
    return { erro: 'E-mail ou senha incorretos.' }
  }
  // O mesmo cookie do /admin: quem entra aqui também está logado lá (e vice-versa).
  ;(await cookies()).set(tokenCookie(payload), resultado.token ?? '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: resultado.exp ? new Date(resultado.exp * 1000) : undefined,
  })
  redirect('/painel')
}

export async function sair() {
  const payload = await getPayload({ config })
  const jar = await cookies()
  jar.delete(tokenCookie(payload))
  jar.delete(COOKIE_LOJA)
  redirect('/painel/entrar')
}

/** Para quem cuida de mais de uma loja: escolhe com qual trabalhar. */
export async function trocarLoja(form: FormData) {
  const { lojas } = await sessao()
  const id = Number(form.get('loja'))
  if (lojas.some((l) => l.id === id)) {
    ;(await cookies()).set(COOKIE_LOJA, String(id), { httpOnly: true, sameSite: 'lax', path: '/' })
  }
  redirect('/painel')
}

// ---------- Pedidos ----------

export async function mudarStatus(id: number, status: Status): Promise<{ ok: boolean }> {
  if (!STATUS.includes(status)) return { ok: false }
  const { payload, loja, comoUsuario } = await sessao()
  try {
    // where com a loja: mesmo o administrador só mexe nos pedidos da loja aberta no painel.
    const r = await payload.update({
      collection: 'pedidos',
      where: { id: { equals: id }, loja: { equals: loja.id } },
      data: { status },
      ...comoUsuario,
    })
    return { ok: r.docs.length === 1 }
  } catch {
    return { ok: false }
  }
}

// ---------- Rota de entrega ----------

/**
 * Chave do Google Maps usada por esta loja. Hoje todas usam a do sistema (variável
 * GOOGLE_MAPS_KEY na Vercel); para uma loja usar a própria, basta devolver a dela aqui.
 */
function chaveGoogle(_loja: Loja): string | undefined {
  return process.env.GOOGLE_MAPS_KEY || undefined
}

/**
 * Pede ao Google a melhor ordem das paradas (Routes API, optimizeWaypointOrder).
 * Devolve os índices das paradas na nova ordem, ou null se o Google não respondeu.
 */
async function ordemGoogle(chave: string, loja: string, paradas: string[]) {
  try {
    const r = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': chave,
        'X-Goog-FieldMask': 'routes.optimizedIntermediateWaypointIndex',
      },
      body: JSON.stringify({
        origin: { address: loja },
        destination: { address: loja },
        intermediates: paradas.map((address) => ({ address })),
        travelMode: 'DRIVE',
        optimizeWaypointOrder: true,
      }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!r.ok) return null
    const ordem: unknown = (await r.json())?.routes?.[0]?.optimizedIntermediateWaypointIndex
    // Com uma parada só o Google não manda a ordem: não tem o que trocar.
    if (paradas.length === 1) return [0]
    return Array.isArray(ordem) && ordem.length === paradas.length ? (ordem as number[]) : null
  } catch {
    return null
  }
}

export type Rota =
  | { ok: true; link: string; numeros: number[]; otimizada: boolean }
  | { ok: false; erro: string }

/** Monta a rota do entregador com os pedidos de entrega escolhidos no painel. */
export async function montarRota(ids: number[]): Promise<Rota> {
  const { payload, loja, comoUsuario } = await sessao()
  const enderecoLoja = loja.endereco?.trim()
  if (!enderecoLoja)
    return { ok: false, erro: 'Coloque o endereço da loja em "Dados da loja" para montar a rota.' }
  if (!ids.length) return { ok: false, erro: 'Escolha os pedidos que vão na rota.' }
  if (ids.length > MAX_PARADAS) {
    return {
      ok: false,
      erro: `O Google Maps aceita até ${MAX_PARADAS} paradas por rota. Divida em duas rotas.`,
    }
  }

  const { docs } = await payload.find({
    collection: 'pedidos',
    where: { id: { in: ids }, loja: { equals: loja.id }, modo: { equals: 'entrega' } },
    depth: 0,
    limit: MAX_PARADAS,
    sort: 'numero',
    ...comoUsuario,
  })
  const pedidos = docs.filter((p) => p.endereco)
  if (!pedidos.length) return { ok: false, erro: 'Nenhum dos pedidos escolhidos tem endereço.' }

  const paradas = pedidos.map((p) => comCidade(p.endereco!, enderecoLoja))
  const chave = chaveGoogle(loja)
  const ordem = chave ? await ordemGoogle(chave, enderecoLoja, paradas) : null
  // Sem chave ou sem resposta do Google, a rota segue a ordem dos pedidos.
  const indices = ordem ?? paradas.map((_, i) => i)
  return {
    ok: true,
    link: linkMaps(
      enderecoLoja,
      indices.map((i) => paradas[i]),
    ),
    numeros: indices.map((i) => pedidos[i].numero),
    otimizada: Boolean(ordem),
  }
}

// ---------- Imagens ----------

/**
 * Sobe a imagem do formulário (já reduzida no navegador) e devolve o id dela.
 * Sem arquivo, devolve undefined (não mexe na imagem atual).
 */
async function subirImagem(form: FormData, campo: string, alt: string) {
  const arquivo = form.get(campo)
  if (!(arquivo instanceof File) || arquivo.size === 0) return undefined
  if (!arquivo.type.startsWith('image/')) throw new Error('O arquivo precisa ser uma imagem.')
  const { payload, loja, comoUsuario } = await sessao()
  const media = await payload.create({
    collection: 'media',
    data: { alt, loja: loja.id },
    file: {
      data: Buffer.from(await arquivo.arrayBuffer()),
      mimetype: arquivo.type,
      name: arquivo.name,
      size: arquivo.size,
    },
    ...comoUsuario,
  })
  return media.id
}

/** Imagem nova, imagem removida (null) ou sem mudança (undefined). */
async function imagem(form: FormData, campo: string, alt: string) {
  if (marcado(form, `${campo}-remover`)) return null
  return subirImagem(form, campo, alt)
}

// ---------- Produtos ----------

export async function salvarProduto(id: number | null, _: Estado, form: FormData): Promise<Estado> {
  const { payload, loja, comoUsuario } = await sessao()
  const nome = texto(form, 'nome')
  const preco = lerPreco(texto(form, 'preco'))
  if (!nome) return { erro: 'Coloque o nome do produto.' }
  if (preco === null) return { erro: 'Preço inválido. Use, por exemplo, 32,90.' }

  // A categoria precisa ser desta loja.
  const categoria = Number(form.get('categoria'))
  const { totalDocs } = await payload.count({
    collection: 'categorias',
    where: { id: { equals: categoria }, loja: { equals: loja.id } },
  })
  if (!totalDocs) return { erro: 'Escolha uma categoria.' }

  try {
    const foto = await imagem(form, 'foto', nome)
    const data = {
      nome,
      descricao: texto(form, 'descricao'),
      preco,
      categoria,
      esgotado: marcado(form, 'esgotado'),
      ordem: Number(form.get('ordem')) || 0,
      ...(foto !== undefined && { foto }),
    }
    if (id === null) {
      await payload.create({ collection: 'produtos', data: { ...data, loja: loja.id }, ...comoUsuario })
    } else {
      const r = await payload.update({
        collection: 'produtos',
        where: { id: { equals: id }, loja: { equals: loja.id } },
        data,
        ...comoUsuario,
      })
      if (r.docs.length !== 1) return { erro: 'Produto não encontrado.' }
    }
  } catch (e) {
    return { erro: e instanceof Error && !('data' in e) ? e.message : mensagem(e) }
  }
  redirect('/painel/produtos')
}

export async function apagarProduto(id: number) {
  const { payload, loja, comoUsuario } = await sessao()
  await payload.delete({
    collection: 'produtos',
    where: { id: { equals: id }, loja: { equals: loja.id } },
    ...comoUsuario,
  })
  redirect('/painel/produtos')
}

export async function marcarEsgotado(id: number, esgotado: boolean) {
  const { payload, loja, comoUsuario } = await sessao()
  await payload.update({
    collection: 'produtos',
    where: { id: { equals: id }, loja: { equals: loja.id } },
    data: { esgotado },
    ...comoUsuario,
  })
  redirect('/painel/produtos')
}

// ---------- Categorias ----------

export async function salvarCategoria(id: number | null, _: Estado, form: FormData): Promise<Estado> {
  const { payload, loja, comoUsuario } = await sessao()
  const nome = texto(form, 'nome')
  if (!nome) return { erro: 'Coloque o nome da categoria.' }
  const data = { nome, ordem: Number(form.get('ordem')) || 0 }
  try {
    if (id === null) {
      await payload.create({ collection: 'categorias', data: { ...data, loja: loja.id }, ...comoUsuario })
    } else {
      await payload.update({
        collection: 'categorias',
        where: { id: { equals: id }, loja: { equals: loja.id } },
        data,
        ...comoUsuario,
      })
    }
  } catch (e) {
    return { erro: mensagem(e) }
  }
  redirect('/painel/categorias')
}

export async function apagarCategoria(id: number, _: Estado): Promise<Estado> {
  const { payload, loja, comoUsuario } = await sessao()
  const { totalDocs } = await payload.count({
    collection: 'produtos',
    where: { categoria: { equals: id }, loja: { equals: loja.id } },
  })
  if (totalDocs) {
    return { erro: `Esta categoria tem ${totalDocs} produto(s). Mude-os de categoria ou apague antes.` }
  }
  await payload.delete({
    collection: 'categorias',
    where: { id: { equals: id }, loja: { equals: loja.id } },
    ...comoUsuario,
  })
  redirect('/painel/categorias')
}

// ---------- Dados da loja ----------

export async function salvarLoja(_: Estado, form: FormData): Promise<Estado> {
  const { payload, loja, comoUsuario } = await sessao()
  const nome = texto(form, 'nome')
  if (!nome) return { erro: 'Coloque o nome da loja.' }
  const taxa = lerPreco(texto(form, 'taxaEntrega') || '0')
  const formasPagamento = FORMAS_PAGAMENTO.map((f) => f.value).filter((v) => form.getAll('formasPagamento').includes(v))
  if (!formasPagamento.length) return { erro: 'Marque pelo menos uma forma de pagamento.' }
  const chavePix = texto(form, 'chavePix').slice(0, 100)
  if (formasPagamento.includes('pix') && !chavePix) {
    return { erro: 'Coloque a chave Pix ou desmarque Pix nas formas de pagamento.' }
  }
  if (taxa === null) return { erro: 'Taxa de entrega inválida. Use, por exemplo, 6,00.' }

  try {
    const logo = await imagem(form, 'logo', `Logo da ${nome}`)
    const capa = await imagem(form, 'capa', `Capa da ${nome}`)
    await payload.update({
      collection: 'lojas',
      id: loja.id,
      data: {
        nome,
        whatsapp: texto(form, 'whatsapp'),
        corPrincipal: texto(form, 'corPrincipal'),
        fonte: texto(form, 'fonte') as Loja['fonte'],
        horario: texto(form, 'horario'),
        endereco: texto(form, 'endereco'),
        aberta: marcado(form, 'aberta'),
        fazEntrega: marcado(form, 'fazEntrega'),
        taxaEntrega: taxa,
        aceitaRetirada: marcado(form, 'aceitaRetirada'),
        formasPagamento,
        chavePix,
        ...(logo !== undefined && { logo }),
        ...(capa !== undefined && { capa }),
      },
      ...comoUsuario,
    })
  } catch (e) {
    return { erro: e instanceof Error && !('data' in e) ? e.message : mensagem(e) }
  }
  redirect('/painel/loja?salvo=1')
}
