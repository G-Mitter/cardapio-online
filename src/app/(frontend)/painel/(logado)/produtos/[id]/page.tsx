import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CampoImagem } from '@/components/painel/CampoImagem'
import { Formulario } from '@/components/painel/Formulario'
import { gruposDoProduto, opcoesComoTexto } from '@/lib/opcoes'
import { sessao } from '@/lib/painel'
import { SELOS } from '@/lib/selos'
import type { Media } from '@/payload-types'

import { apagarProduto, salvarProduto } from '../../../actions'

export const metadata: Metadata = { title: 'Produto' }

const reais = (v: number) => v.toFixed(2).replace('.', ',')

/** Cadastro de um produto. /painel/produtos/novo cria; /painel/produtos/<id> edita. */
export default async function Produto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { payload, loja, comoUsuario } = await sessao()
  const novo = id === 'novo'

  const [categorias, existentes] = await Promise.all([
    payload.find({ collection: 'categorias', where: { loja: { equals: loja.id } }, sort: 'ordem', limit: 0, depth: 0, ...comoUsuario }),
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
  const categoriaAtual = typeof produto?.categoria === 'object' ? produto.categoria.id : produto?.categoria

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
          <textarea name="descricao" defaultValue={produto?.descricao ?? ''} rows={3} maxLength={500} />
        </label>
        <div className="linha">
          <label className="campo">
            Preço (R$)
            <input
              name="preco"
              inputMode="decimal"
              placeholder="32,90"
              defaultValue={produto ? reais(produto.preco) : ''}
              required
            />
          </label>
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
        <label className="campo">
          Opções e adicionais (opcional)
          <textarea
            name="opcoes"
            rows={7}
            defaultValue={opcoesComoTexto(gruposDoProduto(produto?.opcoes))}
            placeholder={'Tamanho: obrigatório\n- Média\n- Grande = 8,00\nExtras: até 3\n- Bacon = 4,00\n- Queijo = 3,50'}
          />
          <small>
            Uma linha para o grupo (com <b>obrigatório</b> e/ou <b>até 3</b> depois dos dois-pontos; sem isso, é
            opcional e de escolha única) e uma linha com <b>-</b> para cada item, com o valor a somar depois
            do <b>=</b>.
          </small>
        </label>
        <CampoImagem nome="foto" rotulo="Foto" atual={foto?.url ?? null} />
        <div className="linha">
          <label className="marcar">
            <input type="checkbox" name="esgotado" defaultChecked={Boolean(produto?.esgotado)} />
            Esgotado (aparece no cardápio, mas não dá para pedir)
          </label>
          <label className="campo curto">
            Ordem
            <input name="ordem" type="number" defaultValue={produto?.ordem ?? 0} />
          </label>
        </div>
        <button className="botao">Salvar</button>
      </Formulario>

      {produto && (
        <details className="perigo">
          <summary>Apagar este produto</summary>
          <form action={apagarProduto.bind(null, produto.id)}>
            <p>O produto sai do cardápio. Isso não pode ser desfeito.</p>
            <button className="botao perigo">Apagar {produto.nome}</button>
          </form>
        </details>
      )}
    </>
  )
}
