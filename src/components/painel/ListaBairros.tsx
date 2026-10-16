'use client'

import { useEffect, useRef, useState } from 'react'

import { dinheiroDeCentavos } from '@/lib/mascaras'

import { BotaoApagar } from './Apagar'
import { CampoDinheiro } from './CampoDinheiro'

type Linha = { id: number; nome: string; taxa: number }

/** Texto "Centro = 5,00" por linha (como a loja guarda) → linhas da lista. */
const deTexto = (texto: string): Linha[] =>
  texto
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l, id) => {
      const [nome, valor = '0'] = l.split('=').map((p) => p.trim())
      return { id, nome, taxa: Number(valor.replace(/\./g, '').replace(',', '.')) || 0 }
    })

const paraTexto = (linhas: Linha[]) =>
  linhas
    .filter((l) => l.nome.trim())
    .map((l) => `${l.nome.trim().replace(/=/g, '')} = ${dinheiroDeCentavos(Math.round(l.taxa * 100))}`)
    .join('\n')

/** Taxa de entrega por bairro: uma linha para cada bairro, com o nome e o valor. Envia o texto no campo `bairros`. */
export function ListaBairros({ inicial, aoMudar }: { inicial: string; aoMudar?: (texto: string) => void }) {
  const [linhas, atualiza] = useState(() => deTexto(inicial))
  const proximo = useRef(linhas.length)
  // A prévia da loja recebe o texto a cada mudança (quem usa passa um `aoMudar` estável).
  useEffect(() => aoMudar?.(paraTexto(linhas)), [linhas, aoMudar])
  const muda = (id: number, parte: Partial<Linha>) =>
    atualiza((a) => a.map((l) => (l.id === id ? { ...l, ...parte } : l)))

  return (
    <fieldset className="campo">
      <legend>Taxa por bairro (opcional)</legend>
      <input type="hidden" name="bairros" value={paraTexto(linhas)} />
      {linhas.map((l, i) => (
        <div key={l.id} className="linha bairro">
          <label className="campo">
            Bairro {i + 1}
            <input value={l.nome} maxLength={60} onChange={(e) => muda(l.id, { nome: e.target.value })} />
          </label>
          <label className="campo curto">
            Taxa (R$)
            <CampoDinheiro rotulo={`Taxa do bairro ${l.nome || i + 1}`} inicial={l.taxa} aoMudar={(taxa) => muda(l.id, { taxa })} semRotulo />
          </label>
          <BotaoApagar
            chave={`bairro-${l.id}`}
            nome={l.nome ? `o bairro ${l.nome}` : `o bairro ${i + 1}`}
            className="botao secundario"
            local={{
              apagar: () => atualiza((a) => a.filter((x) => x.id !== l.id)),
              restaurar: () => atualiza((a) => [...a.slice(0, i), l, ...a.slice(i)]),
            }}
          />
        </div>
      ))}
      <button
        type="button"
        className="botao secundario"
        onClick={() => atualiza((a) => [...a, { id: proximo.current++, nome: '', taxa: 0 }])}
      >
        Adicionar bairro
      </button>
      <small>
        Se preencher, a loja entrega só nesses bairros e a taxa única acima não é usada. Deixe sem bairros para usar a
        taxa única.
      </small>
    </fieldset>
  )
}
