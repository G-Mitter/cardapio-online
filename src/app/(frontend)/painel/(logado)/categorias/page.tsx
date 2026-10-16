import type { Metadata } from 'next'

import { Apagavel, BotaoApagar } from '@/components/painel/Apagar'
import { Formulario } from '@/components/painel/Formulario'
import { sessao } from '@/lib/painel'
import { SUGESTOES_SETOR } from '@/lib/setores'

import { apagarCategoria, moverCategoria, salvarCategoria } from '../../actions'

export const metadata: Metadata = { title: 'Categorias' }

/** Categorias do cardápio: renomear, mudar a ordem com as setas, criar e apagar, tudo numa tela. */
export default async function Categorias() {
  const { payload, loja, comoUsuario } = await sessao('cardapio')
  const { docs } = await payload.find({
    collection: 'categorias',
    where: { loja: { equals: loja.id } },
    sort: ['ordem', 'id'],
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
      <p className="vazio">Use as setas para mudar a sequência das categorias no cardápio. O setor (Cozinha, Bar, Sobremesas...) separa os itens na tela da cozinha; vazio vale Cozinha.</p>
      <datalist id="setores">
        {[...new Set([...SUGESTOES_SETOR, ...docs.flatMap((c) => (c.setor ? [c.setor] : []))])].map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      <ul className="categorias">
        {docs.map((c, i) => (
          <Apagavel key={c.id} chave={`categoria:${c.id}`}>
            <Formulario acao={salvarCategoria.bind(null, c.id)} className="form-linha">
              <input name="nome" defaultValue={c.nome} aria-label="Nome" required maxLength={60} />
              <input name="setor" defaultValue={c.setor ?? ''} aria-label={`Setor de ${c.nome}`} placeholder="Setor: Cozinha" list="setores" maxLength={30} />
              <button className="botao secundario">Salvar</button>
            </Formulario>
            <span className="setas">
              <form action={moverCategoria.bind(null, c.id, -1)}>
                <button aria-label={`Subir ${c.nome}`} disabled={i === 0}>↑</button>
              </form>
              <form action={moverCategoria.bind(null, c.id, 1)}>
                <button aria-label={`Descer ${c.nome}`} disabled={i === docs.length - 1}>↓</button>
              </form>
            </span>
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
        <input name="setor" placeholder="Setor: Cozinha" aria-label="Setor" list="setores" maxLength={30} />
        <button className="botao">Criar</button>
      </Formulario>
    </>
  )
}
