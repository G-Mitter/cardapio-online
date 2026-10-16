import type { Metadata } from 'next'

import { Apagavel, BotaoApagar } from '@/components/painel/Apagar'
import { Formulario } from '@/components/painel/Formulario'
import { rotuloQuantidade, situacao, UNIDADES } from '@/lib/estoque'
import { brl } from '@/lib/pedido'
import { sessao } from '@/lib/painel'

import { ajustarEstoque, apagarIngrediente, salvarIngrediente } from '../../actions'

export const metadata: Metadata = { title: 'Estoque' }

const AVISO = { acabou: 'Acabou', baixo: 'Acabando', ok: '' } as const
const ORDEM = { acabou: 0, baixo: 1, ok: 2 } as const

/** Ingredientes: quanto há, entrada e contagem, e o aviso quando chega ao mínimo. */
export default async function Estoque() {
  const { payload, loja, comoUsuario } = await sessao('cardapio')
  const { docs } = await payload.find({
    collection: 'ingredientes',
    where: { loja: { equals: loja.id } },
    sort: 'nome',
    limit: 0,
    depth: 0,
    ...comoUsuario,
  })
  const { docs: comFicha } = await payload.find({ collection: 'produtos', where: { loja: { equals: loja.id }, 'ficha.ingrediente': { exists: true } }, limit: 0, depth: 0, ...comoUsuario })
  const usados = new Set(comFicha.flatMap((p) => (p.ficha ?? []).map((l) => (typeof l.ingrediente === 'object' ? l.ingrediente.id : l.ingrediente))))
  const itens = docs
    .map((i) => ({ ...i, situacao: situacao(i.quantidade, i.minimo) }))
    .sort((a, b) => ORDEM[a.situacao] - ORDEM[b.situacao] || a.nome.localeCompare(b.nome, 'pt'))
  const faltando = itens.filter((i) => i.situacao !== 'ok').length

  return (
    <>
      <h1>Estoque</h1>
      {faltando > 0 && (
        <p role="status" className="erro">
          {faltando} {faltando === 1 ? 'ingrediente acabando ou em falta' : 'ingredientes acabando ou em falta'}.
        </p>
      )}
      {!itens.length && <p className="vazio">Nenhum ingrediente ainda.</p>}
      <ul className="lista">
        {itens.map((i) => (
          <Apagavel key={i.id} chave={`ingrediente:${i.id}`} className={i.situacao === 'acabou' ? 'esgotado' : undefined}>
            <div className="lista__nome">
              <b>{i.nome}</b>
              <span>
                {rotuloQuantidade(i.quantidade, i.unidade)}
                {i.minimo > 0 && ` · avisa em ${rotuloQuantidade(i.minimo, i.unidade)}`}
                {i.custo != null && ` · custo ${brl(i.custo)} por ${i.unidade}`}
                {AVISO[i.situacao] && ` · ${AVISO[i.situacao]}`}
              </span>
            </div>
            <Formulario key={i.quantidade} acao={ajustarEstoque.bind(null, i.id)} className="form linha">
              <select name="modo" aria-label={`Tipo de ajuste de ${i.nome}`} defaultValue="somar">
                <option value="somar">Entrou</option>
                <option value="definir">Contagem</option>
              </select>
              <input name="valor" inputMode="decimal" required aria-label={`Quantidade de ${i.nome}`} placeholder="10" />
              <button className="botao secundario">Registrar</button>
            </Formulario>
            <details>
              <summary>Editar</summary>
              <Formulario acao={salvarIngrediente.bind(null, i.id)}>
                <label className="campo">
                  Nome
                  <input name="nome" required maxLength={80} defaultValue={i.nome} />
                </label>
                <div className="linha">
                  <label className="campo">
                    Unidade
                    <select name="unidade" defaultValue={i.unidade}>
                      {UNIDADES.map((u) => (
                        <option key={u.valor} value={u.valor}>
                          {u.rotulo}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="campo">
                    Avisar quando chegar a
                    <input name="minimo" inputMode="decimal" defaultValue={String(i.minimo).replace('.', ',')} />
                  </label>
                  <label className="campo">
                    Custo por {i.unidade} (R$)
                    <input name="custo" inputMode="decimal" defaultValue={i.custo != null ? String(i.custo).replace('.', ',') : ''} placeholder="32,00" />
                  </label>
                </div>
                <button className="botao">Salvar</button>
              </Formulario>
            </details>
            <BotaoApagar
              chave={`ingrediente:${i.id}`}
              nome={i.nome}
              acao={apagarIngrediente.bind(null, i.id)}
              bloqueio={usados.has(i.id) ? `${i.nome} está na ficha técnica de um produto. Tire de lá antes de apagar.` : undefined}
            />
          </Apagavel>
        ))}
      </ul>

      <h2>Novo ingrediente</h2>
      <Formulario key={docs.length} acao={salvarIngrediente.bind(null, null)}>
        <label className="campo">
          Nome
          <input name="nome" required maxLength={80} placeholder="Mussarela" />
        </label>
        <div className="linha">
          <label className="campo">
            Unidade
            <select name="unidade" defaultValue="un">
              {UNIDADES.map((u) => (
                <option key={u.valor} value={u.valor}>
                  {u.rotulo}
                </option>
              ))}
            </select>
          </label>
          <label className="campo">
            Quantidade agora
            <input name="quantidade" inputMode="decimal" placeholder="0" />
          </label>
          <label className="campo">
            Avisar quando chegar a (opcional)
            <input name="minimo" inputMode="decimal" placeholder="2" />
          </label>
          <label className="campo">
            Custo por unidade (R$, opcional)
            <input name="custo" inputMode="decimal" placeholder="32,00" />
          </label>
        </div>
        <button className="botao">Cadastrar</button>
      </Formulario>
    </>
  )
}
