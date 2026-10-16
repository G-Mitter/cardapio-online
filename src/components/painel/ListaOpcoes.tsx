'use client'

import { useRef, useState } from 'react'

import type { GrupoOpcao } from '@/lib/opcoes'

import { BotaoApagar } from './Apagar'
import { CampoDinheiro } from './CampoDinheiro'
import { Contador } from './Contador'

type Item = { id: number; nome: string; preco: number }
type Grupo = { id: number; nome: string; obrigatorio: boolean; max: number; itens: Item[] }

/**
 * Opções e adicionais do produto: um cartão por grupo (Tamanho, Extras...) com a lista de itens
 * (descrição e valor). Vai no formulário como JSON no campo `opcoes`; o servidor confere tudo de novo.
 */
export function ListaOpcoes({ inicial }: { inicial: GrupoOpcao[] }) {
  // Ids só da tela (chave de lista): a contagem começa depois dos que já nasceram do banco.
  const proximo = useRef(inicial.reduce((n, g) => n + 1 + g.itens.length, 0))
  const [grupos, atualiza] = useState<Grupo[]>(() => {
    let id = 0
    return inicial.map((g) => ({
      id: id++,
      nome: g.nome,
      obrigatorio: g.min > 0,
      max: g.max,
      itens: g.itens.map((i) => ({ id: id++, nome: i.nome, preco: i.preco })),
    }))
  })
  const mudaGrupo = (id: number, parte: Partial<Grupo>) =>
    atualiza((a) => a.map((g) => (g.id === id ? { ...g, ...parte } : g)))
  const mudaItem = (gid: number, id: number, parte: Partial<Item>) =>
    atualiza((a) =>
      a.map((g) => (g.id === gid ? { ...g, itens: g.itens.map((i) => (i.id === id ? { ...i, ...parte } : i)) } : g)),
    )
  const novoItem = (): Item => ({ id: proximo.current++, nome: '', preco: 0 })

  return (
    <fieldset className="campo lista-opcoes">
      <legend>Opções e adicionais (opcional)</legend>
      <input
        type="hidden"
        name="opcoes"
        value={JSON.stringify(
          grupos.map((g) => ({
            nome: g.nome,
            obrigatorio: g.obrigatorio,
            max: g.max,
            itens: g.itens.map((i) => ({ nome: i.nome, preco: i.preco })),
          })),
        )}
      />
      {grupos.map((g, n) => (
        <div key={g.id} className="grupo-opcao">
          <label className="campo">
            Grupo {n + 1}
            <input
              value={g.nome}
              maxLength={60}
              placeholder="Ex.: Tamanho, Extras"
              onChange={(e) => mudaGrupo(g.id, { nome: e.target.value })}
            />
          </label>
          <div className="linha">
            <label className="marcar">
              <input
                type="checkbox"
                checked={g.obrigatorio}
                onChange={(e) => mudaGrupo(g.id, { obrigatorio: e.target.checked })}
              />
              Obrigatório
            </label>
            <Contador rotulo="Máximo de escolhas" inicial={g.max} min={1} max={99} aoMudar={(max) => mudaGrupo(g.id, { max })} />
          </div>
          {g.itens.map((i, m) => (
            <div key={i.id} className="linha bairro">
              <label className="campo">
                Descrição
                <input
                  value={i.nome}
                  maxLength={60}
                  placeholder="Ex.: Grande"
                  onChange={(e) => mudaItem(g.id, i.id, { nome: e.target.value })}
                />
              </label>
              <label className="campo curto">
                Valor (R$)
                <CampoDinheiro
                  rotulo={`Valor de ${i.nome || `item ${m + 1}`}`}
                  inicial={i.preco}
                  aoMudar={(preco) => mudaItem(g.id, i.id, { preco })}
                  semRotulo
                />
              </label>
              <BotaoApagar
                chave={`opcao-${g.id}-${i.id}`}
                nome={i.nome ? `o item ${i.nome}` : `o item ${m + 1}`}
                className="botao secundario"
                local={{
                  apagar: () => mudaGrupo(g.id, { itens: g.itens.filter((x) => x.id !== i.id) }),
                  restaurar: () =>
                    atualiza((a) =>
                      a.map((x) =>
                        x.id === g.id && !x.itens.some((y) => y.id === i.id)
                          ? { ...x, itens: [...x.itens.slice(0, m), i, ...x.itens.slice(m)] }
                          : x,
                      ),
                    ),
                }}
              />
            </div>
          ))}
          <div className="linha">
            <button type="button" className="botao secundario" onClick={() => mudaGrupo(g.id, { itens: [...g.itens, novoItem()] })}>
              Adicionar item
            </button>
            <BotaoApagar
              chave={`grupo-opcao-${g.id}`}
              nome={g.nome ? `o grupo ${g.nome}` : `o grupo ${n + 1}`}
              className="botao secundario"
              local={{
                apagar: () => atualiza((a) => a.filter((x) => x.id !== g.id)),
                restaurar: () =>
                  atualiza((a) => (a.some((x) => x.id === g.id) ? a : [...a.slice(0, n), g, ...a.slice(n)])),
              }}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        className="botao secundario"
        onClick={() => atualiza((a) => [...a, { id: proximo.current++, nome: '', obrigatorio: false, max: 1, itens: [novoItem()] }])}
      >
        Adicionar grupo
      </button>
      <small>
        Cada grupo é uma escolha do cliente (ex.: Tamanho). Obrigatório obriga a escolher; o máximo é quantos itens ele pode marcar. O valor
        do item é somado ao preço do produto.
      </small>
    </fieldset>
  )
}
