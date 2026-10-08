'use client'

import { useState, useTransition } from 'react'

import { lerCsv } from '@/lib/planilha'
import { brl } from '@/lib/pedido'

import {
  confirmarImportacao,
  type Previa,
  previaImportacao,
  type Resultado,
} from './importar-actions'

type Loja = { id: number; nome: string; slug: string }
type Tabela = (string | number | boolean | null)[][]

const MODELO =
  'nome;descricao;preco;categoria;esgotado\n' +
  'Feijão tropeiro;Feijão, farinha, torresmo e couve;32,90;Pratos do dia;\n' +
  'Suco de laranja;500 ml;9,00;Bebidas;\n'

/** Lê .csv como texto e .xlsx com a biblioteca read-excel-file, sempre no navegador. */
async function lerArquivo(arquivo: File): Promise<Tabela> {
  if (/\.xlsx$/i.test(arquivo.name)) {
    const { readSheet } = await import('read-excel-file/browser')
    const linhas = await readSheet(arquivo)
    // Texto, número e sim/não passam direto; o resto (datas) vira texto.
    return linhas.map((l) =>
      l.map((c) =>
        c == null || typeof c === 'string' || typeof c === 'number' || typeof c === 'boolean'
          ? c
          : String(c),
      ),
    )
  }
  return lerCsv(await arquivo.text())
}

export function Importador({ lojas }: { lojas: Loja[] }) {
  const [lojaId, setLojaId] = useState(lojas[0]?.id)
  const [tabela, setTabela] = useState<Tabela | null>(null)
  const [previa, setPrevia] = useState<Previa | null>(null)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [erroArquivo, setErroArquivo] = useState('')
  const [ocupado, startTransition] = useTransition()
  const loja = lojas.find((l) => l.id === lojaId)

  if (!lojas.length) return <p>Nenhuma loja vinculada ao seu usuário.</p>

  function escolher(arquivo: File | undefined) {
    setPrevia(null)
    setResultado(null)
    setErroArquivo('')
    if (!arquivo || lojaId === undefined) return
    startTransition(async () => {
      try {
        const t = await lerArquivo(arquivo)
        setTabela(t)
        setPrevia(await previaImportacao(lojaId, t))
      } catch {
        setErroArquivo('Não consegui ler o arquivo. Envie um .csv ou .xlsx.')
      }
    })
  }

  function confirmar() {
    if (!tabela || lojaId === undefined) return
    startTransition(async () => {
      setResultado(await confirmarImportacao(lojaId, tabela))
      setPrevia(null)
    })
  }

  const novos = previa?.ok ? previa.itens.filter((i) => i.acao === 'novo').length : 0
  const atualiza = previa?.ok ? previa.itens.length - novos : 0

  return (
    <div className="importador">
      <p>
        Envie um arquivo <b>.csv</b> ou <b>.xlsx</b> com uma linha de títulos: <b>nome</b>,{' '}
        <b>preco</b>, <b>categoria</b> e, se quiser, <b>descricao</b> e <b>esgotado</b>. Produtos
        com o mesmo nome de um já cadastrado são atualizados.{' '}
        <a
          href={`data:text/csv;charset=utf-8,${encodeURIComponent('﻿' + MODELO)}`}
          download="modelo-produtos.csv"
        >
          Baixar planilha modelo
        </a>
      </p>

      {lojas.length > 1 && (
        <label className="campo">
          Loja
          <select
            value={lojaId}
            onChange={(e) => {
              setLojaId(Number(e.target.value))
              setPrevia(null)
              setResultado(null)
            }}
          >
            {lojas.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nome}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="campo">
        Planilha
        <input
          type="file"
          accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(e) => escolher(e.target.files?.[0])}
          disabled={ocupado}
        />
      </label>

      {ocupado && <p>Processando…</p>}
      {erroArquivo && <p className="erro">{erroArquivo}</p>}
      {previa && !previa.ok && <p className="erro">{previa.erro}</p>}

      {previa?.ok && (
        <>
          <h2>Prévia para {loja?.nome}</h2>
          <p>
            {novos} {novos === 1 ? 'produto novo' : 'produtos novos'}, {atualiza}{' '}
            {atualiza === 1 ? 'atualizado' : 'atualizados'}
            {previa.categoriasNovas.length > 0 && (
              <>, categorias novas: {previa.categoriasNovas.join(', ')}</>
            )}
            {previa.erros.length > 0 && (
              <>. {previa.erros.length} linha(s) com erro ficam de fora.</>
            )}
          </p>

          {previa.erros.length > 0 && (
            <ul className="erro">
              {previa.erros.map((e) => (
                <li key={e.linha}>
                  Linha {e.linha}: {e.motivo}
                </li>
              ))}
            </ul>
          )}

          {previa.itens.length > 0 && (
            <>
              <div className="tabela">
                <table>
                  <thead>
                    <tr>
                      <th>Linha</th>
                      <th>Produto</th>
                      <th>Categoria</th>
                      <th>Preço</th>
                      <th>O que acontece</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previa.itens.map((i) => (
                      <tr key={i.linha}>
                        <td>{i.linha}</td>
                        <td>{i.nome}</td>
                        <td>{i.categoria}</td>
                        <td>{brl(i.preco)}</td>
                        <td>{i.acao === 'novo' ? 'Novo' : 'Atualiza'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                className="botao"
                onClick={confirmar}
                disabled={ocupado}
              >
                Importar {previa.itens.length} {previa.itens.length === 1 ? 'produto' : 'produtos'}
              </button>
            </>
          )}
        </>
      )}

      {resultado && !resultado.ok && <p className="erro">{resultado.erro}</p>}
      {resultado?.ok && (
        <p>
          Pronto: {resultado.criados} criados, {resultado.atualizados} atualizados
          {resultado.categorias > 0 && <> e {resultado.categorias} categorias novas</>}.{' '}
          {loja && (
            <a href={`/${loja.slug}`} target="_blank" rel="noreferrer">
              Ver cardápio
            </a>
          )}
        </p>
      )}
    </div>
  )
}
