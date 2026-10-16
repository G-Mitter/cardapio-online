import type { Metadata } from 'next'

import { diasSemPedir, agruparClientes, filtrarClientes, lerInteiro } from '@/lib/clientes-loja'
import { mascararTelefone } from '@/lib/mascaras'
import { sessao } from '@/lib/painel'
import { brl } from '@/lib/pedido'
import { whatsappUrl } from '@/lib/whatsapp'

import { marcarPromocoes } from '../../actions'

export const metadata: Metadata = { title: 'Clientes' }

type Busca = { q?: string; sumiu?: string; min?: string }

/** Quem pede nesta loja (pelos pedidos), com filtros e um botão para chamar no WhatsApp, um de cada vez. */
export default async function Clientes({ searchParams }: { searchParams: Promise<Busca> }) {
  const { q, sumiu, min } = await searchParams
  const { payload, loja, comoUsuario } = await sessao('pedidos')
  const [pedidos, contatos] = await Promise.all([
    payload.find({
      collection: 'pedidos',
      where: { loja: { equals: loja.id }, telefone: { exists: true } },
      select: { nome: true, telefone: true, total: true, status: true, createdAt: true },
      limit: 0,
      depth: 0,
      ...comoUsuario,
    }),
    payload.find({ collection: 'contatos', where: { loja: { equals: loja.id }, aceitaPromocoes: { equals: true } }, select: { telefone: true }, limit: 0, depth: 0, ...comoUsuario }),
  ])
  const aceitam = new Set(contatos.docs.map((x) => x.telefone))
  const todos = agruparClientes(pedidos.docs)
  const lista = filtrarClientes(todos, { busca: q, semPedirHa: lerInteiro(sumiu), minimoDePedidos: lerInteiro(min) })
  const dataBr = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })

  return (
    <>
      <h1>Clientes</h1>
      <p>Quem já pediu aqui, pelo telefone do pedido. Pedidos cancelados e sem telefone não entram.</p>
      <form className="linha" method="get">
        <label className="campo">
          Nome ou telefone
          <input name="q" defaultValue={q ?? ''} maxLength={60} />
        </label>
        <label className="campo curto">
          Sem pedir há (dias)
          <input name="sumiu" type="number" min={1} max={9999} defaultValue={lerInteiro(sumiu) ?? ''} placeholder="30" />
        </label>
        <label className="campo curto">
          Pelo menos (pedidos)
          <input name="min" type="number" min={1} max={9999} defaultValue={lerInteiro(min) ?? ''} placeholder="3" />
        </label>
        <button className="botao">Filtrar</button>
      </form>

      <p>
        {lista.length} de {todos.length} clientes · {todos.filter((x) => aceitam.has(x.telefone)).length} aceitam promoções
      </p>
      {!lista.length && <p className="vazio">Nenhum cliente encontrado.</p>}
      <ul className="lista">
        {lista.map((x) => {
          const link = whatsappUrl(x.telefone)
          const aceita = aceitam.has(x.telefone)
          return (
            <li key={x.telefone}>
              <div className="lista__nome">
                <b>
                  {x.nome} · {mascararTelefone(x.telefone)}
                </b>
                <span>
                  {x.pedidos} {x.pedidos === 1 ? 'pedido' : 'pedidos'} · {brl(x.total)} · último em {dataBr(x.ultimo)} (há {diasSemPedir(x.ultimo)} dias)
                </span>
              </div>
              {link && (
                <a className="botao secundario" href={link} target="_blank" rel="noreferrer">
                  Chamar no WhatsApp
                </a>
              )}
              <form action={marcarPromocoes.bind(null, x.telefone, !aceita)}>
                <button className={aceita ? 'botao' : 'botao secundario'} title="Marque só depois que o cliente concordar em receber promoções">
                  {aceita ? 'Aceita promoções ✓' : 'Não aceita promoções'}
                </button>
              </form>
            </li>
          )
        })}
      </ul>
      <small>
        Marque “aceita promoções” só depois que o cliente disser que quer receber. Sem isso ele não entra em nenhum envio. CPF não fica no cadastro.
      </small>
    </>
  )
}
