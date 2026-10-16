'use client'

import { useState } from 'react'

import { cadastrarLoja } from '@/app/(frontend)/cadastrar/actions'
import { Formulario } from '@/components/painel/Formulario'
import { slugDoNome } from '@/lib/cadastro'
import { mascararTelefone } from '@/lib/mascaras'

/** Formulário de cadastro da loja. O endereço do cardápio é sugerido pelo nome da loja até a pessoa mexer nele. */
export function FormCadastro() {
  const [nomeLoja, setNomeLoja] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEditado, setSlugEditado] = useState(false)
  const [whatsapp, setWhatsapp] = useState('')

  return (
    <Formulario acao={cadastrarLoja}>
      <h2>Você</h2>
      <label className="campo">
        Seu nome
        <input name="nome" required maxLength={80} autoComplete="name" />
      </label>
      <label className="campo">
        E-mail (será o seu login)
        <input type="email" name="email" required autoComplete="email" autoCapitalize="none" />
      </label>
      <label className="campo">
        Senha (mínimo 8 caracteres)
        <input type="password" name="senha" required minLength={8} autoComplete="new-password" />
      </label>
      <label className="campo">
        CPF ou CNPJ
        <input name="documento" required inputMode="numeric" maxLength={18} autoComplete="off" />
      </label>

      <h2>Sua loja</h2>
      <label className="campo">
        Nome da loja
        <input
          name="nomeLoja"
          required
          maxLength={80}
          value={nomeLoja}
          onChange={(e) => {
            setNomeLoja(e.target.value)
            if (!slugEditado) setSlug(slugDoNome(e.target.value))
          }}
        />
      </label>
      <label className="campo">
        WhatsApp que recebe os pedidos
        <input
          name="whatsapp"
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder="(31) 99999-0000"
          value={whatsapp}
          onChange={(e) => setWhatsapp(mascararTelefone(e.target.value))}
        />
      </label>
      <label className="campo">
        Endereço do cardápio
        <input
          name="slug"
          required
          maxLength={40}
          autoCapitalize="none"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value.toLowerCase())
            setSlugEditado(true)
          }}
        />
        <span className="vazio">Só letras minúsculas, números e hífen. Fica assim no link do cardápio.</span>
      </label>

      {/* Isca para robôs: pessoa nenhuma vê nem preenche. */}
      <input name="site" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />

      <label className="marcar">
        <input type="checkbox" name="aceite" required />
        <span>
          Li e aceito os{' '}
          <a href="/termos" target="_blank">
            termos de uso
          </a>{' '}
          e a{' '}
          <a href="/privacidade" target="_blank">
            política de privacidade
          </a>
          .
        </span>
      </label>
      <button className="botao">Criar minha loja</button>
    </Formulario>
  )
}
