'use server'

import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import type { Estado } from '@/app/(frontend)/painel/actions'
import { erroDoSlug, lerDocumento } from '@/lib/cadastro'
import { iniciarSessao } from '@/lib/painel'
import { FORMAS_PAGAMENTO } from '@/lib/pedido'
import { whatsappUrl } from '@/lib/whatsapp'
import config from '@/payload.config'

const texto = (form: FormData, campo: string) => String(form.get(campo) ?? '').trim()

const FALHA = 'Não foi possível cadastrar agora. Tente de novo.'

/**
 * Cadastro da loja feito pelo próprio cliente: cria a loja e o dono já ligados, entra no painel.
 * A loja fica no ar na hora (decisão do Guilherme); por isso o campo escondido "site" (isca para robôs)
 * e a lista de endereços reservados. Não há pagamento nem confirmação de e-mail ainda.
 */
export async function cadastrarLoja(_: Estado, form: FormData): Promise<Estado> {
  if (texto(form, 'site')) return { erro: FALHA }

  const nome = texto(form, 'nome')
  const email = texto(form, 'email').toLowerCase()
  const senha = String(form.get('senha') ?? '')
  const documento = lerDocumento(texto(form, 'documento'))
  const whatsapp = texto(form, 'whatsapp')
  const nomeLoja = texto(form, 'nomeLoja')
  const slug = texto(form, 'slug').toLowerCase()

  if (!nome) return { erro: 'Informe o seu nome.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { erro: 'Informe um e-mail válido.' }
  if (senha.length < 8) return { erro: 'A senha precisa ter pelo menos 8 caracteres.' }
  if (!documento) return { erro: 'CPF ou CNPJ inválido. Confira os números.' }
  if (!whatsappUrl(whatsapp)) return { erro: 'Número de WhatsApp incompleto. Coloque o DDD e o número.' }
  if (!nomeLoja) return { erro: 'Informe o nome da loja.' }
  const erroSlug = erroDoSlug(slug)
  if (erroSlug) return { erro: erroSlug }
  if (form.get('aceite') !== 'on') return { erro: 'Para continuar, aceite os termos de uso e a política de privacidade.' }

  const payload = await getPayload({ config })
  const [comEmail, comSlug] = await Promise.all([
    payload.count({ collection: 'users', where: { email: { equals: email } } }),
    payload.count({ collection: 'lojas', where: { slug: { equals: slug } } }),
  ])
  if (comEmail.totalDocs) return { erro: 'Este e-mail já tem cadastro. Entre no painel com ele.' }
  if (comSlug.totalDocs) return { erro: 'Este endereço do cardápio já está em uso. Escolha outro.' }

  let resultado
  try {
    const loja = await payload.create({
      collection: 'lojas',
      data: {
        nome: nomeLoja,
        slug,
        whatsapp,
        documento,
        aceitouTermosEm: new Date().toISOString(),
        formasPagamento: FORMAS_PAGAMENTO.map((f) => f.value),
      },
    })
    try {
      await payload.create({
        collection: 'users',
        data: { email, password: senha, nome, roles: ['loja'], tenants: [{ tenant: loja.id }] },
      })
    } catch (e) {
      // Sem o dono, a loja ficaria no ar sem ninguém: desfaz.
      await payload.delete({ collection: 'lojas', id: loja.id })
      throw e
    }
    resultado = await payload.login({ collection: 'users', data: { email, password: senha } })
  } catch {
    return { erro: FALHA }
  }
  await iniciarSessao(payload, resultado)
  redirect('/painel')
}
