'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'

import type { LinhaFicha } from '@/lib/estoque'

import { BotaoApagar } from './Apagar'

type Ingrediente = { id: number; nome: string; unidade: string }
type Linha = { id: number; ingrediente: number | ''; quantidade: string }

/**
 * Ficha técnica do produto: uma linha por ingrediente com a quantidade de uma unidade do prato.
 * Vai no formulário como JSON no campo `ficha`; o servidor confere tudo de novo.
 */
export function ListaFicha({ inicial, ingredientes }: { inicial: LinhaFicha[]; ingredientes: Ingrediente[] }) {
  const proximo = useRef(inicial.length)
  const [linhas, atualiza] = useState<Linha[]>(() =>
    inicial.map((l, id) => ({ id, ingrediente: l.ingrediente, quantidade: String(l.quantidade).replace('.', ',') })),
  )
  const muda = (id: number, parte: Partial<Linha>) => atualiza((a) => a.map((l) => (l.id === id ? { ...l, ...parte } : l)))

  return (
    <fieldset className="campo">
      <legend>Ficha técnica (opcional)</legend>
      <input type="hidden" name="ficha" value={JSON.stringify(linhas.map(({ ingrediente, quantidade }) => ({ ingrediente, quantidade })))} />
      {!ingredientes.length && (
        <small>
          Cadastre os ingredientes em <Link href="/painel/estoque">Estoque</Link> para montar a ficha.
        </small>
      )}
      {linhas.map((l, i) => {
        const unidade = ingredientes.find((x) => x.id === l.ingrediente)?.unidade
        return (
          <div key={l.id} className="linha bairro">
            <label className="campo">
              Ingrediente {i + 1}
              <select value={l.ingrediente} onChange={(e) => muda(l.id, { ingrediente: Number(e.target.value) || '' })}>
                <option value="">Escolha…</option>
                {ingredientes.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="campo curto">
              Quantidade{unidade ? ` (${unidade})` : ''}
              <input inputMode="decimal" value={l.quantidade} placeholder="0,15" onChange={(e) => muda(l.id, { quantidade: e.target.value })} />
            </label>
            <BotaoApagar
              chave={`ficha-${l.id}`}
              nome={`o ingrediente ${i + 1} da ficha`}
              className="botao secundario"
              local={{
                apagar: () => atualiza((a) => a.filter((x) => x.id !== l.id)),
                restaurar: () => atualiza((a) => [...a.slice(0, i), l, ...a.slice(i)]),
              }}
            />
          </div>
        )
      })}
      {ingredientes.length > 0 && (
        <button type="button" className="botao secundario" onClick={() => atualiza((a) => [...a, { id: proximo.current++, ingrediente: '', quantidade: '' }])}>
          Adicionar ingrediente
        </button>
      )}
      <small>O que leva uma unidade do prato. A cada pedido o estoque baixa, e o prato pausa sozinho quando um ingrediente acaba.</small>
    </fieldset>
  )
}
