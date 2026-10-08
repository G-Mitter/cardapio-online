'use client'

import { useRef, useState, useTransition } from 'react'

import { lerFotoNoGoogle, totalCartaoDoDia } from '@/app/(frontend)/painel/(logado)/financeiro/maquininha/actions'
import {
  avaliarFoto,
  conferirSoma,
  juntarLeituras,
  type LeituraFoto,
  lerTextoOcr,
  medirImagem,
  type VendaFoto,
  vendasParaCsv,
} from '@/lib/fotoMaquininha'
import { brl } from '@/lib/pedido'
import { lerPreco } from '@/lib/planilha'

type Foto = { dataUrl: string; leitura: LeituraFoto }

/** Foto reduzida (envio e OCR), com a conferência de tamanho, luz e nitidez feita aqui no celular. */
async function prepararFoto(arquivo: File): Promise<{ ok: true; canvas: HTMLCanvasElement; dataUrl: string } | { ok: false; motivo: string }> {
  let bmp: ImageBitmap
  try {
    bmp = await createImageBitmap(arquivo)
  } catch {
    return { ok: false, motivo: 'Não consegui abrir esta imagem. Tire a foto de novo.' }
  }
  const desenhar = (maior: number) => {
    const escala = Math.min(1, maior / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas')
    c.width = Math.round(bmp.width * escala)
    c.height = Math.round(bmp.height * escala)
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
    return c
  }
  // A nitidez só compara entre fotos se todas forem medidas no mesmo tamanho.
  const med = desenhar(1000)
  const px = med.getContext('2d')!.getImageData(0, 0, med.width, med.height).data
  const cinza = new Uint8ClampedArray(med.width * med.height)
  for (let i = 0; i < cinza.length; i++) cinza[i] = 0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]
  const v = avaliarFoto({ largura: bmp.width, altura: bmp.height, ...medirImagem(cinza, med.width, med.height) })
  if (!v.ok) return v
  const canvas = desenhar(1600)
  return { ok: true, canvas, dataUrl: canvas.toDataURL('image/jpeg', 0.8) }
}

const dataBr = (d: string) => d.split('-').reverse().join('/')

/**
 * Tirar foto do relatório da maquininha e ler as vendas: primeiro no celular (grátis, a foto não sai daqui),
 * depois, se a loja aceitar, pelo Google. A loja confere e corrige a tabela antes de usar.
 */
export function FotoMaquininha({ onUsar }: { onUsar: (csv: string) => void }) {
  const [fotos, setFotos] = useState<Foto[]>([])
  const [google, setGoogle] = useState<LeituraFoto | null>(null)
  const [linhas, setLinhas] = useState<VendaFoto[] | null>(null)
  const [aviso, setAviso] = useState('')
  const [lendo, setLendo] = useState('')
  const [totalCartao, setTotalCartao] = useState<number | null>(null)
  const [ocupado, startTransition] = useTransition()
  const trabalhador = useRef<{ recognize: (c: HTMLCanvasElement) => Promise<{ data: { text: string } }> } | null>(null)

  const leitura = google ?? juntarLeituras(fotos.map((f) => f.leitura))
  const soma = fotos.length || google ? conferirSoma(leitura) : null
  const soTotais = Boolean(fotos.length || google) && !leitura.vendas.length && (leitura.totalDebito !== null || leitura.totalCredito !== null)

  async function adicionar(arquivos: FileList | null) {
    setAviso('')
    setGoogle(null)
    setLinhas(null)
    const novas: Foto[] = []
    for (const a of Array.from(arquivos ?? [])) {
      setLendo('Conferindo a foto…')
      const p = await prepararFoto(a)
      if (!p.ok) {
        setAviso(p.motivo)
        break
      }
      setLendo('Lendo a foto no seu celular… a primeira vez demora um pouco.')
      try {
        if (!trabalhador.current) {
          const { createWorker } = await import('tesseract.js')
          trabalhador.current = (await createWorker('por')) as never
        }
        const r = await trabalhador.current!.recognize(p.canvas)
        novas.push({ dataUrl: p.dataUrl, leitura: lerTextoOcr(r.data.text) })
      } catch {
        // Sem leitura no celular (rede, memória): a foto segue para o Google, se a loja aceitar.
        novas.push({ dataUrl: p.dataUrl, leitura: lerTextoOcr('') })
      }
    }
    setLendo('')
    setFotos((f) => [...f, ...novas].slice(0, 4))
  }

  function lerNoGoogle() {
    setAviso('')
    startTransition(async () => {
      const r = await lerFotoNoGoogle(fotos.map((f) => f.dataUrl))
      if (r.ok) {
        setGoogle(r.leitura)
        setLinhas(null)
      } else setAviso(r.motivo)
    })
  }

  function recomecar() {
    setFotos([])
    setGoogle(null)
    setLinhas(null)
    setAviso('')
    setTotalCartao(null)
  }

  function usar() {
    const feitas = (linhas ?? leitura.vendas)
    if (feitas.some((v) => !v.dia || !/^\d{1,2}:\d{2}$/.test(v.hora) || !(v.valor > 0))) {
      setAviso('Preencha dia, hora e valor de todas as vendas (ou apague a linha).')
      return
    }
    setAviso('')
    onUsar(vendasParaCsv(feitas))
  }

  function compararTotais() {
    const dia = leitura.dia
    if (!dia) return setAviso('Não achei a data do relatório na foto. Use o arquivo da maquininha ou digite as vendas.')
    startTransition(async () => setTotalCartao(await totalCartaoDoDia(dia)))
  }

  const mudar = (i: number, p: Partial<VendaFoto>) => setLinhas((ls) => (ls ?? leitura.vendas).map((v, j) => (j === i ? { ...v, ...p } : v)))
  const tabela = linhas ?? leitura.vendas

  return (
    <div className="campo">
      <p>
        Tire uma foto do <b>relatório de vendas do dia</b> que sai da maquininha. Deixe o papel liso, com boa luz e sem flash. Se o papel for
        comprido, tire mais de uma foto, uma de cada parte.
      </p>
      <label className="botao">
        {fotos.length ? 'Adicionar outra foto' : 'Tirar foto do relatório'}
        <input type="file" accept="image/*" capture="environment" multiple hidden onChange={(e) => { void adicionar(e.target.files); e.target.value = '' }} disabled={Boolean(lendo) || ocupado || fotos.length >= 4} />
      </label>{' '}
      {fotos.length > 0 && (
        <button type="button" className="botao secundario" onClick={recomecar}>
          Começar de novo
        </button>
      )}
      {lendo && <p>{lendo}</p>}
      {aviso && <p className="erro">{aviso}</p>}
      {fotos.length > 0 && <p>{fotos.length} foto(s) lida(s) neste celular. A foto não é guardada.</p>}

      {soma && !soma.ok && !google && (
        <>
          <p className="erro">{soma.motivo}</p>
          <p>Tire outra foto, ou deixe o Google ler (grátis).</p>
          <p className="vazio">
            Ao tocar em &quot;Ler pelo Google&quot;, a foto é enviada a um serviço do Google na camada gratuita, que pode usar o conteúdo para melhorar os
            produtos dele. O papel não deve mostrar dados de clientes além das vendas.
          </p>
          <button type="button" className="botao secundario" onClick={lerNoGoogle} disabled={ocupado}>
            {ocupado ? 'Lendo…' : 'Ler pelo Google'}
          </button>
        </>
      )}
      {soma && !soma.ok && google && <p className="erro">{soma.motivo}</p>}

      {soTotais && (
        <>
          <p>
            O relatório só traz totais: débito <b>{leitura.totalDebito !== null ? brl(leitura.totalDebito) : '—'}</b> e crédito{' '}
            <b>{leitura.totalCredito !== null ? brl(leitura.totalCredito) : '—'}</b>
            {leitura.dia && <> em {dataBr(leitura.dia)}</>}. Não dá para conferir venda por venda, só o total do dia.
          </p>
          <button type="button" className="botao secundario" onClick={compararTotais} disabled={ocupado}>
            Comparar com os pedidos em cartão do dia
          </button>
          {totalCartao !== null && (() => {
            const maq = (leitura.totalDebito ?? 0) + (leitura.totalCredito ?? 0)
            const dif = Math.round((maq - totalCartao) * 100) / 100
            return (
              <p>
                Maquininha: <b>{brl(maq)}</b> · Pedidos em cartão: <b>{brl(totalCartao)}</b> ·{' '}
                {dif === 0 ? <span className="ok">Confere</span> : <span className="erro">{dif > 0 ? `Sobrou ${brl(dif)} na maquininha` : `Faltou ${brl(-dif)} na maquininha`}</span>}
              </p>
            )
          })()}
        </>
      )}

      {tabela.length > 0 && (
        <>
          <h3>Vendas lidas ({tabela.length})</h3>
          <p>Confira com o papel e corrija o que estiver errado.</p>
          <div className="tabela">
            <table>
              <thead>
                <tr>
                  <th>Dia</th>
                  <th>Hora</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tabela.map((v, i) => (
                  <tr key={i}>
                    <td><input type="date" aria-label="Dia" value={v.dia} onChange={(e) => mudar(i, { dia: e.target.value })} /></td>
                    <td><input type="time" aria-label="Hora" value={v.hora} onChange={(e) => mudar(i, { hora: e.target.value })} /></td>
                    <td>
                      <select aria-label="Tipo" value={v.tipo} onChange={(e) => mudar(i, { tipo: e.target.value as VendaFoto['tipo'] })}>
                        <option value="débito">Débito</option>
                        <option value="crédito">Crédito</option>
                      </select>
                    </td>
                    <td>
                      <input
                        aria-label="Valor"
                        inputMode="decimal"
                        defaultValue={v.valor.toFixed(2).replace('.', ',')}
                        onBlur={(e) => mudar(i, { valor: lerPreco(e.target.value) ?? 0 })}
                      />
                    </td>
                    <td>
                      <button type="button" className="botao secundario" onClick={() => setLinhas((ls) => (ls ?? leitura.vendas).filter((_, j) => j !== i))}>
                        Apagar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="botao" onClick={usar}>
            Usar estas vendas
          </button>
        </>
      )}
    </div>
  )
}
