import type { Metadata } from 'next'

import { Apagavel, BotaoApagar } from '@/components/painel/Apagar'
import { Formulario } from '@/components/painel/Formulario'
import { sessao } from '@/lib/painel'

import { apagarCategoria, salvarCategoria } from '../../actions'

export const metadata: Metadata = { title: 'Categorias' }

/** Categorias do cardápio: renomear, mudar a ordem, criar e apagar, tudo numa tela. */
export default async function Categorias() {
  const { payload, loja, comoUsuario } = await sessao()
  const { docs } = await payload.find({
    collection: 'categorias',
    where: { loja: { equals: loja.id } },
    sort: 'ordem',
    limit: 0,
    depth: 0,
    ...comoUsuario,
  })

  // Categoria com produto não se apaga: o aviso já diz isso antes de perguntar.
  const { docs: produtos } = await payload.find({
    collection: 'produtos',
    where: { loja: { equals: loja.id } },
    select: { categoria: true },
    limit: 0,
    depth: 0,
    ...comoUsuario,
  })
  const usos = new Map<number, number>()
  for (const p of produtos) {
    const id = typeof p.categoria === 'number' ? p.categoria : p.categoria?.id
    if (id) usos.set(id, (usos.get(id) ?? 0) + 1)
  }

  return (
    <>
      <h1>Categorias</h1>
      <p className="vazio">A ordem define a sequência no cardápio: menor aparece primeiro.</p>
      <ul className="categorias">
        {docs.map((c) => (
          <Apagavel key={c.id} chave={`categoria:${c.id}`}>
            <Formulario acao={salvarCategoria.bind(null, c.id)} className="form-linha">
              <input name="nome" defaultValue={c.nome} aria-label="Nome" required maxLength={60} />
              <input name="ordem" type="number" defaultValue={c.ordem ?? 0} aria-label="Ordem" className="curto" />
              <button className="botao secundario">Salvar</button>
            </Formulario>
            <BotaoApagar
              chave={`categoria:${c.id}`}
              nome={c.nome}
              acao={apagarCategoria.bind(null, c.id)}
              bloqueio={
                usos.get(c.id)
                  ? `${c.nome} tem ${usos.get(c.id)} produto(s). Mude-os de categoria ou apague antes.`
                  : undefined
              }
            />
          </Apagavel>
        ))}
      </ul>
      <h2>Nova categoria</h2>
      <Formulario key={docs.length} acao={salvarCategoria.bind(null, null)} className="form-linha">
        <input name="nome" placeholder="Ex.: Sobremesas" aria-label="Nome" required maxLength={60} />
        <input name="ordem" type="number" defaultValue={(docs.at(-1)?.ordem ?? 0) + 1} aria-label="Ordem" className="curto" />
        <button className="botao">Criar</button>
      </Formulario>
    </>
  )
}
