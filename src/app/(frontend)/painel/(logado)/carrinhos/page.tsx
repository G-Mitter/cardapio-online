import type { Metadata } from 'next'
import { headers } from 'next/headers'

import { Apagavel, BotaoApagar } from '@/components/painel/Apagar'

import {
  APAGAR_APOS_DIAS,
  emMinutosAtras,
  mensagemRecuperacao,
  PARADO_APOS_MINUTOS,
} from '@/lib/carrinho'
import { sessao } from '@/lib/painel'
import { brl } from '@/lib/pedido'
import { whatsappUrl } from '@/lib/whatsapp'

import { apagarCarrinho } from '../../actions'

export const metadata: Metadata = { title: 'Carrinhos abandonados' }

/** Quem montou o carrinho, se identificou e não finalizou. A loja chama no WhatsApp ou apaga. */
export default async function Carrinhos() {
  const { payload, loja, comoUsuario } = await sessao('pedidos')
  const h = await headers()
  const link = `${h.get('x-forwarded-proto') ?? 'https'}://${h.get('x-forwarded-host') ?? h.get('host')}/${loja.slug}`
  // Limpeza: carrinho velho some sozinho.
  await payload.delete({
    collection: 'carrinhos',
    where: {
      loja: { equals: loja.id },
      updatedAt: { less_than: emMinutosAtras(APAGAR_APOS_DIAS * 24 * 60) },
    },
    ...comoUsuario,
  })
  const { docs } = await payload.find({
    collection: 'carrinhos',
    where: {
      loja: { equals: loja.id },
      updatedAt: { less_than: emMinutosAtras(PARADO_APOS_MINUTOS) },
    },
    sort: '-updatedAt',
    limit: 100,
    depth: 0,
    ...comoUsuario,
  })

  return (
    <>
      <h1>Carrinhos abandonados</h1>
      <p className="vazio">
        Clientes que montaram o carrinho, informaram o telefone e não finalizaram há mais de{' '}
        {PARADO_APOS_MINUTOS} minutos. O carrinho some quando o pedido é feito e, em todo caso,
        depois de {APAGAR_APOS_DIAS} dias.
      </p>
      {!docs.length && <p className="vazio">Nenhum carrinho abandonado agora.</p>}
      <ul className="lista">
        {docs.map((c) => {
          const zap = whatsappUrl(
            c.telefone,
            mensagemRecuperacao({
              nome: c.nome,
              loja: loja.nome,
              resumo: c.resumo,
              total: c.total,
              link,
            }),
          )
          return (
            <Apagavel key={c.id} chave={`carrinho:${c.id}`}>
              <div className="lista__nome">
                <b>{c.nome}</b>
                <span>
                  {c.resumo} · {brl(c.total)}
                </span>
              </div>
              {zap && (
                <a className="botao secundario" href={zap} target="_blank" rel="noopener">
                  Chamar no WhatsApp
                </a>
              )}
              <BotaoApagar chave={`carrinho:${c.id}`} nome={`o carrinho de ${c.nome}`} acao={apagarCarrinho.bind(null, c.id)} />
            </Apagavel>
          )
        })}
      </ul>
    </>
  )
}
