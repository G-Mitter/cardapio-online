import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BotaoApagar } from '@/components/painel/Apagar'
import { CampoDinheiro } from '@/components/painel/CampoDinheiro'
import { Contador } from '@/components/painel/Contador'
import { ListaFicha } from '@/components/painel/ListaFicha'
import { ListaOpcoes } from '@/components/painel/ListaOpcoes'
import { CampoImagem } from '@/components/painel/CampoImagem'
import { Formulario } from '@/components/painel/Formulario'
import { gruposDoProduto } from '@/lib/opcoes'
import { sessao } from '@/lib/painel'
import { SELOS } from '@/lib/selos'
import type { Media } from '@/payload-types'

import { apagarProduto, salvarProduto } from '../../../actions'

export const metadata: Metadata = { title: 'Produto' }

/** Cadastro de um produto. /painel/produtos/novo cria; /painel/produtos/<id> edita. */
export default async function Produto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { payload, loja, comoUsuario } = await sessao('cardapio')
  const novo = id === 'novo'

  const [ingredientes, categorias, existentes] = await Promise.all([
    payload.find({ collection: 'ingredientes', where: { loja: { equals: loja.id } }, sort: 'nome', limit: 0, depth: 0, ...comoUsuario }),
    payload.find({
      collection: 'categorias',
      where: { loja: { equals: loja.id } },
      sort: 'ordem',
      limit: 0,
      depth: 0,
      ...comoUsuario,
    }),
    novo
      ? null
      : payload.find({
          collection: 'produtos',
          where: { id: { equals: Number(id) || 0 }, loja: { equals: loja.id } },
          limit: 1,
          depth: 1,
          ...comoUsuario,
        }),
  ])
  const produto = existentes?.docs[0]
  if (!novo && !produto) notFound()

  const foto = typeof produto?.foto === 'object' ? (produto.foto as Media | null) : null
  const categoriaAtual =
    typeof produto?.categoria === 'object' ? produto.categoria.id : produto?.categoria

  return (
    <>
      <p>
        <Link href="/painel/produtos">← Produtos</Link>
      </p>
      <h1>{novo ? 'Novo produto' : produto!.nome}</h1>
      <Formulario acao={salvarProduto.bind(null, novo ? null : produto!.id)}>
        <label className="campo">
          Nome
          <input name="nome" defaultValue={produto?.nome} required maxLength={120} />
        </label>
        <label className="campo">
          Descrição
          <textarea
            name="descricao"
            defaultValue={produto?.descricao ?? ''}
            rows={3}
            maxLength={500}
          />
        </label>
        <div className="linha">
          <CampoDinheiro rotulo="Preço (R$)" name="preco" inicial={produto?.preco ?? 0} />
          <label className="campo">
            Categoria
            <select name="categoria" defaultValue={categoriaAtual} required>
              {categorias.docs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </label>
        </div>
        <fieldset className="opcoes">
          <legend>Promoção por quantidade (opcional)</legend>
          <div className="linha">
            <Contador rotulo="Leve" name="leve" inicial={produto?.leve ?? 0} max={99} />
            <Contador rotulo="Pague" name="pague" inicial={produto?.pague ?? 0} max={98} />
          </div>
          <small>Ex.: leve 3 e pague 2. A cada 3 unidades, a mais barata sai de graça. Deixe os dois em 0 para não ter promoção.</small>
        </fieldset>
        <fieldset className="opcoes">
          <legend>Selos (aparecem junto do nome no cardápio)</legend>
          {SELOS.map((s) => (
            <label key={s.value} className="marcar">
              <input
                type="checkbox"
                name="selos"
                value={s.value}
                defaultChecked={Boolean(produto?.selos?.includes(s.value))}
              />
              {s.label}
            </label>
          ))}
        </fieldset>
        <ListaOpcoes inicial={gruposDoProduto(produto?.opcoes)} />
        <ListaFicha
          inicial={(produto?.ficha ?? []).map((l) => ({ ingrediente: typeof l.ingrediente === 'object' ? l.ingrediente.id : l.ingrediente, quantidade: l.quantidade }))}
          ingredientes={ingredientes.docs.map((i) => ({ id: i.id, nome: i.nome, unidade: i.unidade }))}
        />
        <CampoImagem nome="foto" rotulo="Foto" atual={foto?.url ?? null} />
        <label className="marcar">
          <input type="checkbox" name="esgotado" defaultChecked={Boolean(produto?.esgotado)} />
          Esgotado (aparece no cardápio, mas não dá para pedir)
        </label>
        {produto?.esgotadoAuto && <small>Pausado pelo estoque: falta um ingrediente da ficha. Volta sozinho quando o estoque for reposto.</small>}
        <button className="botao">Salvar</button>
      </Formulario>

      {produto && (
        <div className="perigo">
          <p>O produto sai do cardápio. Dá para desfazer nos primeiros segundos.</p>
          <BotaoApagar
            chave={`produto:${produto.id}`}
            nome={produto.nome}
            acao={apagarProduto.bind(null, produto.id)}
            voltarPara="/painel/produtos"
            className="botao perigo"
            rotulo="Apagar este produto"
          />
        </div>
      )}
    </>
  )
}
