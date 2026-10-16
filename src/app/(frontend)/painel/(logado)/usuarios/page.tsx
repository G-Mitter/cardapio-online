import type { Metadata } from 'next'

import { Apagavel, BotaoApagar } from '@/components/painel/Apagar'
import { Formulario } from '@/components/painel/Formulario'
import { FormUsuario } from '@/components/painel/FormUsuario'
import { sessao } from '@/lib/painel'
import { efetivas, PERMISSOES, temPermissao } from '@/lib/permissoes'

import { apagarUsuario, ligarUsuario, salvarUsuario, trocarSenhaUsuario } from '../../actions'

export const metadata: Metadata = { title: 'Usuários' }

/** Quem entra no painel desta loja e o que cada um pode fazer. */
export default async function Usuarios({ searchParams }: { searchParams: Promise<{ aviso?: string }> }) {
  const { aviso } = await searchParams
  const { payload, loja, user } = await sessao('usuarios')
  const { docs } = await payload.find({
    collection: 'users',
    where: { 'tenants.tenant': { equals: loja.id }, roles: { contains: 'loja' } },
    sort: 'createdAt',
    limit: 0,
    depth: 0,
  })
  const usuarios = docs.filter((u) => !u.roles?.includes('admin') && !u.roles?.includes('garcom'))
  const minhas = efetivas(user)
  const podeApagar = temPermissao(user, 'excluir')

  return (
    <>
      <h1>Usuários</h1>
      <p>
        Quem entra no painel de <b>{loja.nome}</b> com usuário (ou e-mail) e senha. Garçons ficam na tela Garçons.
      </p>
      {aviso && (
        <p role="alert" className="erro">
          {aviso}
        </p>
      )}
      <ul className="lista">
        {usuarios.map((u) => {
          const eu = u.id === user.id
          const delas = efetivas(u)
          // Só mexe em quem não tem permissões além das suas.
          const posso = !eu && delas.every((p) => minhas.includes(p))
          return (
            <Apagavel key={u.id} chave={`usuario:${u.id}`} className={u.ativo === false ? 'esgotado' : undefined}>
              <div className="lista__nome">
                <b>
                  {u.nome || u.username || u.email}
                  {eu && ' (você)'}
                </b>
                <span>
                  {[u.username && `Login: ${u.username}`, u.email, u.ativo === false && 'Desligado'].filter(Boolean).join(' · ')}
                </span>
                <span>
                  {delas.length === PERMISSOES.length
                    ? 'Pode tudo'
                    : PERMISSOES.filter((p) => delas.includes(p.valor))
                        .map((p) => p.rotulo)
                        .join(' · ')}
                </span>
                {posso && (
                  <details>
                    <summary>Editar permissões</summary>
                    <FormUsuario
                      acao={salvarUsuario.bind(null, u.id)}
                      disponiveis={minhas}
                      inicial={{ nome: u.nome ?? '', permissoes: delas, semUsuario: !u.username }}
                      slug={loja.slug}
                    />
                  </details>
                )}
                {(posso || eu) && (
                  <details>
                    <summary>Trocar senha</summary>
                    <Formulario acao={trocarSenhaUsuario.bind(null, u.id)}>
                      <label className="campo">
                        Nova senha
                        <input name="senha" type="password" minLength={8} autoComplete="new-password" required />
                      </label>
                      <button className="botao secundario">Salvar senha</button>
                    </Formulario>
                  </details>
                )}
              </div>
              {posso && (
                <>
                  <form action={ligarUsuario.bind(null, u.id, u.ativo === false)}>
                    <button className="botao secundario">{u.ativo === false ? 'Ligar' : 'Desligar'}</button>
                  </form>
                  {podeApagar && (
                    <BotaoApagar chave={`usuario:${u.id}`} nome={u.nome || u.username || u.email || 'o usuário'} acao={apagarUsuario.bind(null, u.id)} />
                  )}
                </>
              )}
            </Apagavel>
          )
        })}
      </ul>

      <h2>Novo usuário</h2>
      <FormUsuario key={usuarios.length} acao={salvarUsuario.bind(null, null)} disponiveis={minhas} slug={loja.slug} novo />
      <p>
        <small>
          Você só pode dar permissões que você mesmo tem. Desligar um usuário tira o acesso na hora, mas ele continua no
          histórico.
        </small>
      </p>
    </>
  )
}
