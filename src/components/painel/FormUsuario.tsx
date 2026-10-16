'use client'

import { useState } from 'react'

import type { Estado } from '@/app/(frontend)/painel/actions'
import { PAPEIS, PERMISSOES, type Permissao } from '@/lib/permissoes'

import { CampoUsuario } from './CampoUsuario'
import { Formulario } from './Formulario'

/**
 * Cadastro e edição de usuário da loja: nome, (e-mail e senha inicial, só no cadastro) e as permissões.
 * Os atalhos (Gerente, Atendente, Caixa, Cozinha) marcam várias de uma vez; só valem as que quem
 * cadastra também tem (as outras ficam desligadas, e o servidor confere de novo).
 */
export function FormUsuario({
  acao,
  disponiveis,
  inicial,
  novo,
  slug,
}: {
  acao: (estado: Estado, form: FormData) => Promise<Estado>
  /** Permissões de quem está cadastrando. */
  disponiveis: Permissao[]
  /** `semUsuario`: criado só com e-mail, ainda pode ganhar um usuário para entrar. */
  inicial?: { nome: string; permissoes: Permissao[]; semUsuario?: boolean }
  novo?: boolean
  slug: string
}) {
  const [marcadas, setMarcadas] = useState<Permissao[]>(inicial?.permissoes ?? [])
  const alterna = (p: Permissao) => setMarcadas((m) => (m.includes(p) ? m.filter((x) => x !== p) : [...m, p]))

  return (
    <Formulario acao={acao}>
      <div className="linha">
        <label className="campo">
          Nome
          <input name="nome" defaultValue={inicial?.nome} required maxLength={80} />
        </label>
        {(novo || inicial?.semUsuario) && <CampoUsuario slug={slug} quem="Esta pessoa" obrigatorio={Boolean(novo)} />}
        {novo && (
          <>
            <label className="campo">
              E-mail (opcional)
              <input name="email" type="email" autoComplete="off" maxLength={120} />
            </label>
            <label className="campo">
              Senha inicial
              <input name="senha" type="password" minLength={8} autoComplete="new-password" required />
            </label>
          </>
        )}
      </div>
      <fieldset className="opcoes">
        <legend>Permissões</legend>
        <div className="linha">
          {PAPEIS.map((p) => (
            <button
              key={p.nome}
              type="button"
              className="botao secundario"
              onClick={() => setMarcadas(p.permissoes.filter((x) => disponiveis.includes(x)))}
            >
              {p.nome}
            </button>
          ))}
        </div>
        {PERMISSOES.map((p) => (
          <label key={p.valor} className="marcar">
            <input
              type="checkbox"
              name="permissoes"
              value={p.valor}
              checked={marcadas.includes(p.valor)}
              disabled={!disponiveis.includes(p.valor)}
              onChange={() => alterna(p.valor)}
            />
            <span>
              {p.rotulo} <small>({p.ajuda})</small>
            </span>
          </label>
        ))}
      </fieldset>
      <button className="botao">{novo ? 'Cadastrar' : 'Salvar'}</button>
    </Formulario>
  )
}
