import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Apagavel } from '@/components/painel/Apagar'
import { custoDoPrato, lerFichaSalva, textoDoCusto } from '@/lib/estoque'
import { sessao } from '@/lib/painel'
import { brl } from '@/lib/pedido'
import type { Media } from '@/payload-types'

import { marcarEsgotado, moverProduto } from '../../actions'

export const metadata: Metadata = { title: 'Produtos' }

/** Produtos da loja por categoria, com "esgotado" num toque. */
export default async function Produtos() {
  const { payload, loja, comoUsuario } = await sessao('cardapio')
  const [categorias, produtos, ingredientes] = await Promise.all([
    payload.find({ collection: 'categorias', where: { loja: { equals: loja.id } }, sort: 'ordem', limit: 0, depth: 0, ...comoUsuario }),
    payload.find({ collection: 'produtos', where: { loja: { equals: loja.id } }, sort: ['ordem', 'id'], limit: 0, depth: 1, ...comoUsuario }),
    payload.find({ collection: 'ingredientes', where: { loja: { equals: loja.id } }, limit: 0, depth: 0, ...comoUsuario }),
  ])
  const custos = new Map(ingredientes.docs.map((i) => [i.id, i.custo]))
  const nomes = new Map(ingredientes.docs.map((i) => [i.id, i.nome]))

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
              {daCategoria.map((p, i) => {
                const foto = typeof p.foto === 'object' ? (p.foto as Media | null) : null
                const custo = custoDoPrato(lerFichaSalva(p.ficha), custos, p.preco)
                return (
                  <Apagavel key={p.id} chave={`produto:${p.id}`} className={p.esgotado ? 'esgotado' : undefined}>
                    <span className="miniatura">
                      {foto?.url ? <Image src={foto.url} alt="" width={52} height={52} /> : p.nome[0]}
                    </span>
                    <Link href={`/painel/produtos/${p.id}`} className="lista__nome">
                      <b>{p.nome}</b>
                      <span>
                        {brl(p.preco)}
                        {p.esgotado && (p.esgotadoAuto ? ' · Esgotado (falta ingrediente)' : ' · Esgotado')}
                        {custo && ` · ${textoDoCusto(custo, nomes)}`}
                      </span>
                    </Link>
                    <span className="setas">
                      <form action={moverProduto.bind(null, p.id, -1)}>
                        <button aria-label={`Subir ${p.nome}`} disabled={i === 0}>↑</button>
                      </form>
                      <form action={moverProduto.bind(null, p.id, 1)}>
                        <button aria-label={`Descer ${p.nome}`} disabled={i === daCategoria.length - 1}>↓</button>
                      </form>
                    </span>
                    <form action={marcarEsgotado.bind(null, p.id, !p.esgotado)}>
                      <button className="botao secundario">
                        {p.esgotado ? 'Voltou' : 'Esgotou'}
                      </button>
                    </form>
                  </Apagavel>
                )
              })}
            </ul>
          </section>
        )
      })}
    </>
  )
}
