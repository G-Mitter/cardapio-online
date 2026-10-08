import type { Metadata } from 'next'
import Link from 'next/link'

import { sessao } from '@/lib/painel'
import { brl } from '@/lib/pedido'
import type { Media } from '@/payload-types'

import { marcarEsgotado } from '../../actions'

export const metadata: Metadata = { title: 'Produtos' }

/** Produtos da loja por categoria, com "esgotado" num toque. */
export default async function Produtos() {
  const { payload, loja, comoUsuario } = await sessao()
  const [categorias, produtos] = await Promise.all([
    payload.find({ collection: 'categorias', where: { loja: { equals: loja.id } }, sort: 'ordem', limit: 0, depth: 0, ...comoUsuario }),
    payload.find({ collection: 'produtos', where: { loja: { equals: loja.id } }, sort: 'ordem', limit: 0, depth: 1, ...comoUsuario }),
  ])

  if (!categorias.docs.length) {
    return (
      <>
        <h1>Produtos</h1>
        <p>
          Antes de cadastrar produtos, crie as categorias do cardápio (ex.: Pratos, Bebidas).{' '}
          <Link href="/painel/categorias">Criar categorias</Link>
        </p>
      </>
    )
  }

  return (
    <>
      <div className="titulo">
        <h1>Produtos</h1>
        <Link href="/painel/produtos/novo" className="botao">
          Novo produto
        </Link>
      </div>
      {categorias.docs.map((c) => {
        const daCategoria = produtos.docs.filter(
          (p) => (typeof p.categoria === 'object' ? p.categoria.id : p.categoria) === c.id,
        )
        return (
          <section key={c.id} className="grupo">
            <h2>{c.nome}</h2>
            {!daCategoria.length && <p className="vazio">Nenhum produto nesta categoria.</p>}
            <ul className="lista">
              {daCategoria.map((p) => {
                const foto = typeof p.foto === 'object' ? (p.foto as Media | null) : null
                return (
                  <li key={p.id} className={p.esgotado ? 'esgotado' : undefined}>
                    <span className="miniatura">
                      {/* eslint-disable-next-line @next/next/no-img-element -- miniatura do painel */}
                      {foto?.url ? <img src={foto.url} alt="" /> : p.nome[0]}
                    </span>
                    <Link href={`/painel/produtos/${p.id}`} className="lista__nome">
                      <b>{p.nome}</b>
                      <span>
                        {brl(p.preco)}
                        {p.esgotado && ' · Esgotado'}
                      </span>
                    </Link>
                    <form action={marcarEsgotado.bind(null, p.id, !p.esgotado)}>
                      <button className="botao secundario">
                        {p.esgotado ? 'Voltou' : 'Esgotou'}
                      </button>
                    </form>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </>
  )
}
