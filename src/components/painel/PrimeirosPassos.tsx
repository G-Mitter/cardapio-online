import Link from 'next/link'

import { dispensarPassos } from '@/app/(frontend)/painel/actions'
import type { PassoPainel } from '@/lib/primeirosPassos'

/** Lista de primeiros passos da loja nova, no alto da tela inicial. Some sozinha quando tudo estiver feito. */
export function PrimeirosPassos({ passos }: { passos: PassoPainel[] }) {
  const feitos = passos.filter((p) => p.feito).length
  return (
    <section className="primeiros-passos" aria-labelledby="primeiros-passos-titulo">
      <h2 id="primeiros-passos-titulo">
        Primeiros passos ({feitos} de {passos.length})
      </h2>
      <p className="vazio">Complete a sua loja para o cardápio ficar pronto para os clientes.</p>
      <ul>
        {passos.map((p) => (
          <li key={p.rotulo} className={p.feito ? 'feito' : undefined}>
            <span aria-hidden="true">{p.feito ? '✓' : '○'}</span>
            <Link href={p.href}>{p.rotulo}</Link>
            {p.feito && <span className="vazio"> (feito)</span>}
          </li>
        ))}
      </ul>
      <form action={dispensarPassos}>
        <button className="sair">Não mostrar mais</button>
      </form>
    </section>
  )
}
