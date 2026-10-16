'use client'

import { useRef, useState } from 'react'

type Ingrediente = { id: number; nome: string; unidade: string }
type Linha = { id: number; ingrediente: number | ''; quantidade: string; total: string }

/**
 * Itens de uma compra: ingrediente, quanto veio e quanto se pagou por esse item.
 * Vai no formulário como JSON no campo `itens`; o servidor confere tudo de novo.
 */
export function ListaCompra({ ingredientes }: { ingredientes: Ingrediente[] }) {
  const proximo = useRef(1)
  const [linhas, atualiza] = useState<Linha[]>([{ id: 0, ingrediente: '', quantidade: '', total: '' }])
  const muda = (id: number, parte: Partial<Linha>) => atualiza((a) => a.map((l) => (l.id === id ? { ...l, ...parte } : l)))

  return (
    <fieldset className="campo">
      <legend>Itens da compra</legend>
      <input type="hidden" name="itens" value={JSON.stringify(linhas.map(({ ingrediente, quantidade, total }) => ({ ingrediente, quantidade, total })))} />
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
              <input inputMode="decimal" value={l.quantidade} placeholder="5" onChange={(e) => muda(l.id, { quantidade: e.target.value })} />
            </label>
            <label className="campo curto">
              Pago (R$)
              <input inputMode="decimal" value={l.total} placeholder="160,00" onChange={(e) => muda(l.id, { total: e.target.value })} />
            </label>
            {linhas.length > 1 && (
              <button type="button" className="botao secundario" aria-label={`Tirar o item ${i + 1}`} onClick={() => atualiza((a) => a.filter((x) => x.id !== l.id))}>
                Tirar
              </button>
            )}
          </div>
        )
      })}
      <button type="button" className="botao secundario" onClick={() => atualiza((a) => [...a, { id: proximo.current++, ingrediente: '', quantidade: '', total: '' }])}>
        Adicionar item
      </button>
      <small>O custo de cada ingrediente passa a ser o que você pagou por unidade nesta compra.</small>
    </fieldset>
  )
}
