'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'

import { importarExemplo, relatorioMaquininhaExemplo } from '@/app/(frontend)/painel/(logado)/exemplo/actions'
import { NOMES, type Nome } from '@/lib/exemplo'

type Retorno = Awaited<ReturnType<typeof importarExemplo>>

/** Importar os dados de exemplo (planilhas padrão, ou as que você mandar no lugar) e baixar o relatório de maquininha. */
export function ImportarExemplo() {
  const [enviadas, setEnviadas] = useState<Partial<Record<Nome, string>>>({})
  const [avisoArquivos, setAvisoArquivos] = useState('')
  const [certeza, setCerteza] = useState(false)
  const [retorno, setRetorno] = useState<Retorno | null>(null)
  const [erroRelatorio, setErroRelatorio] = useState('')
  const [ocupado, startTransition] = useTransition()

  async function escolher(arquivos: FileList | null) {
    const lidas: Partial<Record<Nome, string>> = {}
    const ignorados: string[] = []
    for (const a of Array.from(arquivos ?? [])) {
      const nome = a.name.replace(/\.csv$/i, '').toLowerCase() as Nome
      if (NOMES.includes(nome)) lidas[nome] = await a.text()
      else ignorados.push(a.name)
    }
    setEnviadas(lidas)
    setAvisoArquivos(ignorados.length ? `Ignorei ${ignorados.join(', ')}: o nome não é de uma planilha de exemplo.` : '')
  }

  function importar() {
    setRetorno(null)
    startTransition(async () => {
      try {
        setRetorno(await importarExemplo(enviadas))
      } catch {
        setRetorno({ ok: false, erro: 'Não consegui falar com o servidor (pode ter passado do tempo limite). Confira Pedidos e tente de novo.' })
      }
      setCerteza(false)
    })
  }

  function baixarRelatorio() {
    setErroRelatorio('')
    startTransition(async () => {
      const r = await relatorioMaquininhaExemplo()
      if (!r.ok) return setErroRelatorio(r.erro)
      const link = document.createElement('a')
      link.href = URL.createObjectURL(new Blob(['﻿' + r.csv], { type: 'text/csv;charset=utf-8' }))
      link.download = 'maquininha-exemplo.csv'
      link.click()
      URL.revokeObjectURL(link.href)
    })
  }

  const enviadasNomes = Object.keys(enviadas)
  return (
    <div className="importador">
      <p>
        Enche a Cantina Dona Lurdes com pedidos de todos os tipos, garçons, entregadores com acertos, contas a pagar e a receber,
        mesas fechadas e carrinhos abandonados. As datas são relativas a hoje, então as telas do dia sempre têm o que mostrar.
        Pode repetir quando quiser: não duplica.
      </p>

      <label className="campo">
        Planilhas (opcional)
        <input type="file" accept=".csv,text/csv" multiple onChange={(e) => escolher(e.target.files)} disabled={ocupado} />
      </label>
      <p>
        {enviadasNomes.length
          ? `Vou usar as suas planilhas: ${enviadasNomes.join(', ')}. As outras seguem o padrão.`
          : 'Sem planilhas enviadas, uso as padrão. Para mudar algo, mande só as que quiser trocar (o arquivo precisa se chamar pedidos.csv, cupons.csv e assim por diante).'}
      </p>
      {avisoArquivos && <p className="erro">{avisoArquivos}</p>}

      {!certeza ? (
        <button type="button" className="botao" onClick={() => setCerteza(true)} disabled={ocupado}>
          Importar dados de exemplo
        </button>
      ) : (
        <div className="form-linha">
          <p className="erro">
            Isto apaga os pedidos, o financeiro, os cupons, os garçons e os entregadores da Cantina e cria os de exemplo. Produtos e
            fotos ficam.
          </p>
          <button type="button" className="botao perigo" onClick={importar} disabled={ocupado}>
            {ocupado ? 'Importando…' : 'Sim, apagar e importar'}
          </button>{' '}
          <button type="button" className="botao secundario" onClick={() => setCerteza(false)} disabled={ocupado}>
            Cancelar
          </button>
        </div>
      )}

      {retorno && !retorno.ok && (
        <>
          <p className="erro">{retorno.erro ?? 'Corrija as planilhas abaixo. Nada foi apagado.'}</p>
          {retorno.erros && (
            <ul className="erro">
              {retorno.erros.map((e, i) => (
                <li key={i}>
                  {e.arquivo}.csv, linha {e.linha}: {e.motivo}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {retorno?.ok && (
        <>
          <p className="ok">Pronto. Foi criado:</p>
          <ul>
            {retorno.resumo.map(([nome, n]) => (
              <li key={nome}>
                {nome}: {n}
              </li>
            ))}
          </ul>
          <p>
            Garçons entram em <code>/painel/entrar</code> com <code>marcos.cantina-dona-lurdes</code> ou{' '}
            <code>juliana.cantina-dona-lurdes</code> e a senha <code>garcom123</code> (se você não trocou a planilha de garçons).
          </p>
        </>
      )}

      <h2>Relatório de maquininha de exemplo</h2>
      <p>
        Feito dos pedidos em cartão que estão no banco, para testar{' '}
        <Link href="/painel/financeiro/maquininha">Conferir a maquininha</Link>: um pedido de ontem fica sem venda e uma venda de R$ 37,50
        fica sem pedido. Importe os dados primeiro.
      </p>
      <button type="button" className="botao secundario" onClick={baixarRelatorio} disabled={ocupado}>
        Baixar relatório de maquininha
      </button>
      {erroRelatorio && <p className="erro">{erroRelatorio}</p>}
    </div>
  )
}
