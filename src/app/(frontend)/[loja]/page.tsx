import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { CategoriaView } from '@/components/Cardapio'
import { LojaAoVivo } from '@/components/LojaAoVivo'
import { gruposDoProduto } from '@/lib/opcoes'
import { rotulosDosSelos } from '@/lib/selos'
import type { Media } from '@/payload-types'
import config from '@/payload.config'

// O cardápio é montado uma vez e servido do cache; mudanças no /admin refazem o cache
// (src/lib/revalidar.ts). A cada hora ele é refeito de qualquer jeito, por segurança.
export const revalidate = 3600
export const generateStaticParams = async () => []

type Props = { params: Promise<{ loja: string }> }

// cache: o generateMetadata e a página pedem a mesma loja; o banco é consultado uma vez só.
const buscarLoja = cache(async (slug: string) => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'lojas',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return docs[0] ?? null
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const loja = await buscarLoja((await params).loja)
  return loja ? { title: loja.nome } : {}
}

export default async function PaginaDaLoja({ params }: Props) {
  const loja = await buscarLoja((await params).loja)
  if (!loja) notFound()

  const payload = await getPayload({ config })
  const [categorias, produtos] = await Promise.all([
    payload.find({
      collection: 'categorias',
      where: { loja: { equals: loja.id } },
      sort: 'ordem',
      limit: 100,
      depth: 0,
    }),
    payload.find({
      collection: 'produtos',
      where: { loja: { equals: loja.id } },
      sort: 'ordem',
      limit: 1000,
      depth: 1,
    }),
  ])

  // Só o que a tela precisa vai para o navegador.
  const secoes: CategoriaView[] = categorias.docs
    .map((c) => ({
      id: c.id,
      nome: c.nome,
      produtos: produtos.docs
        .filter((p) => (typeof p.categoria === 'object' ? p.categoria.id : p.categoria) === c.id)
        .map((p) => {
          const foto = typeof p.foto === 'object' ? (p.foto as Media | null) : null
          return {
            id: p.id,
            nome: p.nome,
            descricao: p.descricao ?? '',
            preco: p.preco,
            esgotado: Boolean(p.esgotado),
            foto: foto?.url ?? null,
            opcoes: gruposDoProduto(p.opcoes),
            selos: rotulosDosSelos(p.selos),
          }
        }),
    }))
    .filter((c) => c.produtos.length > 0)

  return (
    <LojaAoVivo
      loja={{
        id: loja.id,
        nome: loja.nome,
        slug: loja.slug,
        corPrincipal: loja.corPrincipal,
        fonte: loja.fonte,
        logo: loja.logo,
        capa: loja.capa,
        horario: loja.horario,
        endereco: loja.endereco,
        aberta: loja.aberta,
        fazEntrega: loja.fazEntrega,
        aceitaRetirada: loja.aceitaRetirada,
        taxaEntrega: loja.taxaEntrega,
        bairros: loja.bairros,
        formasPagamento: loja.formasPagamento,
      }}
      categorias={secoes}
    />
  )
}
