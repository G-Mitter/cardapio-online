'use client'

import { useLivePreview } from '@payloadcms/live-preview-react'

import { Cardapio, type CategoriaView } from '@/components/Cardapio'
import { lerMesas } from '@/lib/mesas'
import { temaDaLoja } from '@/lib/tema'
import type { Loja, Media } from '@/payload-types'

export type LojaDados = Pick<
  Loja,
  | 'id'
  | 'nome'
  | 'slug'
  | 'corPrincipal'
  | 'fonte'
  | 'logo'
  | 'capa'
  | 'horario'
  | 'endereco'
  | 'aberta'
  | 'fazEntrega'
  | 'aceitaRetirada'
  | 'aceitaAgendamento'
  | 'taxaEntrega'
  | 'bairros'
  | 'mesas'
  | 'formasPagamento'
>

const url = (img: number | Media | null | undefined) =>
  typeof img === 'object' && img?.url ? img.url : null

/**
 * O cardápio com o visual da loja. Dentro do /admin (prévia ao lado do formulário),
 * cores, fonte, logo e textos mudam enquanto o dono edita, antes de salvar.
 * Fora do /admin, mostra só o que veio do servidor.
 */
export function LojaAoVivo({ loja, categorias }: { loja: LojaDados; categorias: CategoriaView[] }) {
  const { data } = useLivePreview<LojaDados>({
    initialData: loja,
    // A prévia roda no mesmo endereço do /admin.
    serverURL: typeof window === 'undefined' ? '' : window.location.origin,
    depth: 1,
  })

  return (
    <div style={temaDaLoja(data)}>
      <Cardapio
        loja={{
          slug: data.slug,
          nome: data.nome,
          logo: url(data.logo),
          capa: url(data.capa),
          horario: data.horario ?? '',
          endereco: data.endereco ?? '',
          aberta: data.aberta !== false,
          fazEntrega: data.fazEntrega !== false,
          aceitaRetirada: data.aceitaRetirada !== false,
          aceitaAgendamento: data.aceitaAgendamento === true,
          taxaEntrega: data.taxaEntrega ?? 0,
          bairros: (data.bairros ?? []).map((b) => ({ nome: b.nome, taxa: b.taxa })),
          mesas: (() => {
            const m = lerMesas(data.mesas ?? '')
            return m.ok ? m.mesas : []
          })(),
          pagamentos: data.formasPagamento ?? [],
        }}
        categorias={categorias}
      />
    </div>
  )
}
