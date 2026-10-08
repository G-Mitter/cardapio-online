import type { Metadata } from 'next'

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

  return (
    <>
      <h1>Categorias</h1>
      <p className="vazio">A ordem define a sequência no cardápio: menor aparece primeiro.</p>
      <ul className="categorias">
        {docs.map((c) => (
          <li key={c.id}>
            <Formulario acao={salvarCategoria.bind(null, c.id)} className="form-linha">
              <input name="nome" defaultValue={c.nome} aria-label="Nome" required maxLength={60} />
              <input name="ordem" type="number" defaultValue={c.ordem ?? 0} aria-label="Ordem" className="curto" />
              <button className="botao secundario">Salvar</button>
            </Formulario>
            <Formulario acao={apagarCategoria.bind(null, c.id)} className="form-apagar">
              <button className="sair" aria-label={`Apagar ${c.nome}`}>
                Apagar
              </button>
            </Formulario>
          </li>
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
