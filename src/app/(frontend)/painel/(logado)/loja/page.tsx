import type { Metadata } from 'next'

import type { CategoriaView } from '@/components/Cardapio'
import { FormLoja } from '@/components/painel/FormLoja'
import { bairrosComoTexto } from '@/lib/entrega'
import { gruposDoProduto } from '@/lib/opcoes'
import { sessao } from '@/lib/painel'
import { COR_PADRAO } from '@/lib/tema'
import { promocaoDoProduto } from '@/lib/promocao'
import { rotulosDosSelos } from '@/lib/selos'
import type { Media } from '@/payload-types'

export const metadata: Metadata = { title: 'Minha loja' }

const url = (img: unknown) => (typeof img === 'object' && img ? ((img as Media).url ?? null) : null)

export default async function MinhaLoja({ searchParams }: { searchParams: Promise<{ salvo?: string }> }) {
  const { payload, loja, comoUsuario } = await sessao()
  const { salvo } = await searchParams

  // Alguns produtos de verdade para a prévia ficar parecida com o cardápio.
  const { docs } = await payload.find({
    collection: 'produtos',
    where: { loja: { equals: loja.id } },
    sort: 'ordem',
    limit: 6,
    depth: 1,
    ...comoUsuario,
  })
  const categorias: CategoriaView[] = docs.length
    ? [
        {
          id: 0,
          nome: 'Alguns produtos',
          produtos: docs.map((p) => ({
            id: p.id,
            nome: p.nome,
            descricao: p.descricao ?? '',
            preco: p.preco,
            esgotado: Boolean(p.esgotado),
            foto: url(p.foto),
            opcoes: gruposDoProduto(p.opcoes),
            selos: rotulosDosSelos(p.selos),
            promocao: promocaoDoProduto(p),
          })),
        },
      ]
    : []

  return (
    <>
      <h1>Minha loja</h1>
      {salvo && (
        <p role="status" className="ok">
          Salvo. O cardápio já está atualizado.
        </p>
      )}
      <FormLoja
        // Remonta o formulário depois de salvar, com os dados novos do banco.
        key={loja.updatedAt}
        loja={{
          nome: loja.nome,
          slug: loja.slug,
          whatsapp: loja.whatsapp,
          corPrincipal: loja.corPrincipal || COR_PADRAO,
          fonte: loja.fonte ?? 'classica',
          horario: loja.horario ?? '',
          endereco: loja.endereco ?? '',
          aberta: loja.aberta !== false,
          fazEntrega: loja.fazEntrega !== false,
          taxaEntrega: loja.taxaEntrega ?? 0,
          bairros: bairrosComoTexto(loja.bairros ?? []),
          pagamentos: loja.formasPagamento ?? [],
          chavePix: loja.chavePix ?? '',
          aceitaRetirada: loja.aceitaRetirada !== false,
          logo: url(loja.logo),
          capa: url(loja.capa),
        }}
        categorias={categorias}
      />
    </>
  )
}
