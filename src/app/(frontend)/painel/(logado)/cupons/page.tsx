import type { Metadata } from 'next'

import { Formulario } from '@/components/painel/Formulario'
import { diaDoFim, rotuloDoCupom } from '@/lib/cupom'
import { sessao } from '@/lib/painel'
import { brl } from '@/lib/pedido'

import { apagarCupom, ligarCupom, salvarCupom } from '../../actions'

export const metadata: Metadata = { title: 'Cupons' }

const dataBr = (iso: string) => diaDoFim(iso).split('-').reverse().join('/')

/** Cupons de desconto: criar, ligar/desligar e apagar. O cliente digita o código no carrinho. */
export default async function Cupons() {
  const { payload, loja, comoUsuario } = await sessao()
  const { docs } = await payload.find({
    collection: 'cupons',
    where: { loja: { equals: loja.id } },
    sort: '-createdAt',
    limit: 0,
    depth: 0,
    ...comoUsuario,
  })

  return (
    <>
      <h1>Cupons</h1>
      {!docs.length && <p className="vazio">Nenhum cupom ainda.</p>}
      <ul className="lista">
        {docs.map((c) => (
          <li key={c.id} className={c.ativo === false ? 'esgotado' : undefined}>
            <div className="lista__nome">
              <b>{c.codigo}</b>
              <span>
                {rotuloDoCupom(c)} de desconto
                {c.minimo ? ` · pedido a partir de ${brl(c.minimo)}` : ''}
                {c.validoAte ? ` · até ${dataBr(c.validoAte)}` : ''}
                {` · usado ${c.usos ?? 0}${c.limiteUso ? ` de ${c.limiteUso}` : ''} vez(es)`}
                {c.ativo === false && ' · Desligado'}
              </span>
            </div>
            <form action={ligarCupom.bind(null, c.id, c.ativo === false)}>
              <button className="botao secundario">{c.ativo === false ? 'Ligar' : 'Desligar'}</button>
            </form>
            <form action={apagarCupom.bind(null, c.id)}>
              <button className="sair" aria-label={`Apagar ${c.codigo}`}>
                Apagar
              </button>
            </form>
          </li>
        ))}
      </ul>

      <h2>Novo cupom</h2>
      <Formulario key={docs.length} acao={salvarCupom}>
        <label className="campo">
          Código (o cliente digita no carrinho)
          <input name="codigo" required minLength={3} maxLength={20} placeholder="BEMVINDO10" />
        </label>
        <div className="linha">
          <label className="campo">
            Tipo
            <select name="tipo" defaultValue="porcentagem">
              <option value="porcentagem">Porcentagem (%)</option>
              <option value="valor">Valor fixo (R$)</option>
            </select>
          </label>
          <label className="campo">
            Valor
            <input name="valor" inputMode="decimal" required placeholder="10" />
          </label>
        </div>
        <div className="linha">
          <label className="campo">
            Pedido mínimo (R$, opcional)
            <input name="minimo" inputMode="decimal" placeholder="40,00" />
          </label>
          <label className="campo">
            Vale até (opcional)
            <input name="validoAte" type="date" />
          </label>
          <label className="campo">
            Limite de usos (opcional)
            <input name="limiteUso" type="number" min={1} />
          </label>
        </div>
        <button className="botao">Criar cupom</button>
      </Formulario>
    </>
  )
}
