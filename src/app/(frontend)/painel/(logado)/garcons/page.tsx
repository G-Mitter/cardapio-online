import type { Metadata } from 'next'

import { Formulario } from '@/components/painel/Formulario'
import { sessao } from '@/lib/painel'

import { ligarGarcom, salvarGarcom, trocarSenhaGarcom } from '../../actions'

export const metadata: Metadata = { title: 'Garçons' }

/** Garçons da loja: cadastro, liga/desliga e troca de senha. Eles entram no mesmo /painel/entrar. */
export default async function Garcons() {
  const { payload, loja } = await sessao()
  // Os garçons não têm acesso próprio; o servidor lista só os desta loja, depois de conferir o dono.
  const { docs } = await payload.find({
    collection: 'users',
    where: { lojaDoGarcom: { equals: loja.id }, roles: { contains: 'garcom' } },
    sort: 'nome',
    limit: 0,
    depth: 0,
  })

  return (
    <>
      <h1>Garçons</h1>
      <p>
        O garçom entra em <b>/painel/entrar</b> com o login e a senha abaixo e vê só as mesas.
      </p>
      {!docs.length && <p className="vazio">Nenhum garçom ainda.</p>}
      <ul className="lista">
        {docs.map((g) => (
          <li key={g.id} className={g.ativo === false ? 'esgotado' : undefined}>
            <div className="lista__nome">
              <b>{g.nome}</b>
              <span>
                Login: {g.username}
                {g.ativo === false && ' · Desligado'}
              </span>
              <details>
                <summary>Trocar senha</summary>
                <Formulario acao={trocarSenhaGarcom.bind(null, g.id)}>
                  <label className="campo">
                    Nova senha
                    <input name="senha" type="password" minLength={6} autoComplete="new-password" required />
                  </label>
                  <button className="botao secundario">Salvar senha</button>
                </Formulario>
              </details>
            </div>
            <form action={ligarGarcom.bind(null, g.id, g.ativo === false)}>
              <button className="botao secundario">{g.ativo === false ? 'Ligar' : 'Desligar'}</button>
            </form>
          </li>
        ))}
      </ul>

      <h2>Novo garçom</h2>
      <Formulario key={docs.length} acao={salvarGarcom}>
        <div className="linha">
          <label className="campo">
            Nome
            <input name="nome" required maxLength={80} />
          </label>
          <label className="campo">
            Usuário
            <input name="usuario" required minLength={3} maxLength={20} autoCapitalize="none" placeholder="maria" />
          </label>
          <label className="campo">
            Senha
            <input name="senha" type="password" minLength={6} autoComplete="new-password" required />
          </label>
        </div>
        <button className="botao">Cadastrar</button>
      </Formulario>
      <p>
        <small>
          O login do garçom fica &quot;usuário.{loja.slug}&quot;. Garçom desligado não entra mais, mas continua no
          relatório.
        </small>
      </p>
    </>
  )
}
