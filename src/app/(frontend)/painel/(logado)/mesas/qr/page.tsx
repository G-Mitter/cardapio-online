import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import QRCode from 'qrcode'

import { Imprimir } from '@/components/painel/Imprimir'
import { Formulario } from '@/components/painel/Formulario'
import { INSTRUCOES_PADRAO, lerMesas } from '@/lib/mesas'
import { sessao } from '@/lib/painel'

import { salvarInstrucoesMesa } from '../../../actions'

export const metadata: Metadata = { title: 'QR Codes das mesas' }

/** Uma folha com o QR Code de cada mesa; cada um abre o cardápio da loja já na mesa certa. */
export default async function QrDasMesas() {
  const { loja } = await sessao()
  const lista = lerMesas(loja.mesas ?? '')
  const mesas = lista.ok ? lista.mesas : []
  if (!mesas.length) {
    return (
      <>
        <h1>QR Codes das mesas</h1>
        <p>
          Cadastre as mesas em <Link href="/painel/loja">Minha loja</Link> para gerar os QR Codes.
        </p>
      </>
    )
  }

  const instrucoes = loja.instrucoesMesa?.trim() || INSTRUCOES_PADRAO
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const origem = `${h.get('x-forwarded-proto') ?? 'https'}://${host}`
  const qrs = await Promise.all(
    mesas.map(async (mesa) => ({
      mesa,
      svg: await QRCode.toString(`${origem}/${loja.slug}?mesa=${encodeURIComponent(mesa)}`, {
        type: 'svg',
        margin: 1,
      }),
    })),
  )

  return (
    <>
      <div className="titulo nao-imprimir">
        <h1>QR Codes das mesas</h1>
        <Imprimir />
      </div>
      <div className="nao-imprimir">
        <Formulario acao={salvarInstrucoesMesa}>
          <label className="campo">
            Instruções impressas embaixo de cada QR Code
            <textarea name="instrucoes" rows={5} maxLength={400} defaultValue={instrucoes} />
            <small>Apague tudo e salve para voltar ao texto sugerido.</small>
          </label>
          <button className="botao secundario">Salvar instruções</button>
        </Formulario>
      </div>
      <div className="qrs">
        {qrs.map((q) => (
          <figure key={q.mesa} className="qr">
            <div dangerouslySetInnerHTML={{ __html: q.svg }} />
            <figcaption>
              <b>Mesa {q.mesa}</b>
              <small className="instrucoes">{instrucoes}</small>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  )
}
