'use client'

import { useEffect, useRef, useState, useTransition } from 'react'

import {
  adicionarEndereco,
  cadastrarCliente,
  identificarCliente,
  type EnderecoResumo,
  type Identificacao as Resposta,
} from '@/app/(frontend)/cliente-actions'
import type { Modo } from '@/lib/pedido'

export type ClienteEscolhido = { telefone: string; enderecoId?: string }

const GUARDADO = 'cardapio-telefone'

function lembrado() {
  try {
    return localStorage.getItem(GUARDADO) ?? ''
  } catch {
    return ''
  }
}

const endereco = (f: FormData) => ({
  rua: String(f.get('rua') ?? ''),
  complemento: String(f.get('complemento') ?? ''),
  bairro: String(f.get('bairro') ?? ''),
})

function CamposEndereco() {
  return (
    <>
      <label>
        Rua e número
        <input name="rua" required maxLength={120} autoComplete="address-line1" />
      </label>
      <label>
        Complemento
        <input name="complemento" maxLength={60} autoComplete="address-line2" />
      </label>
      <label>
        Bairro
        <input name="bairro" required maxLength={60} />
      </label>
    </>
  )
}

/**
 * Telefone primeiro. Cadastro novo pede nome (e endereço, se for entrega); cadastro
 * conhecido mostra só o primeiro nome e os endereços escondidos para escolher.
 * Quem já está identificado avisa o carrinho por `aoMudar`.
 */
export function Identificacao({
  modo,
  aoMudar,
}: {
  modo: Modo
  aoMudar: (c: ClienteEscolhido | null) => void
}) {
  const [telefone, setTelefone] = useState('')
  const [fase, setFase] = useState<'telefone' | 'cadastro' | 'conhecido'>('telefone')
  const [nome, setNome] = useState('')
  const [enderecos, setEnderecos] = useState<EnderecoResumo[]>([])
  const [escolhido, setEscolhido] = useState<string>()
  const [novoEndereco, setNovoEndereco] = useState(false)
  const [erro, setErro] = useState('')
  const [enviando, startTransition] = useTransition()
  const campoTelefone = useRef<HTMLInputElement>(null)
  // Depois de montar: no servidor não existe localStorage, e a tela tem que nascer igual nos dois.
  useEffect(() => {
    if (campoTelefone.current && !campoTelefone.current.value)
      campoTelefone.current.value = lembrado()
  }, [fase])

  function escolher(id: string | undefined, tel = telefone) {
    setEscolhido(id)
    aoMudar({ telefone: tel, enderecoId: id })
  }

  // `tel` vem junto porque o estado `telefone` só muda no próximo render.
  function receber(r: Resposta, tel: string) {
    if (!r.ok) return setErro(r.erro)
    setErro('')
    if (r.novo) return setFase('cadastro')
    try {
      localStorage.setItem(GUARDADO, tel)
    } catch {}
    setFase('conhecido')
    setNome(r.nome)
    setEnderecos(r.enderecos)
    setNovoEndereco(false)
    // O mais recente fica marcado: é o que acabou de ser adicionado ou o último usado.
    escolher(r.enderecos.at(-1)?.id, tel)
  }

  const enviar =
    (acao: (f: FormData, tel: string) => Promise<Resposta>) =>
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const f = new FormData(e.currentTarget)
      const tel = fase === 'telefone' ? String(f.get('telefone') ?? '') : telefone
      setTelefone(tel)
      startTransition(async () => receber(await acao(f, tel), tel))
    }

  function trocar() {
    setFase('telefone')
    setErro('')
    aoMudar(null)
  }

  const mensagemErro = erro && (
    <p className="erro" role="alert">
      {erro}
    </p>
  )

  if (fase === 'telefone') {
    return (
      <form className="identificacao" onSubmit={enviar((_, tel) => identificarCliente(tel))}>
        <label>
          Seu telefone (WhatsApp)
          <input
            ref={campoTelefone}
            name="telefone"
            type="tel"
            defaultValue={telefone}
            required
            autoComplete="tel-national"
            placeholder="(31) 99999-0000"
          />
        </label>
        {mensagemErro}
        <button className="secundario" disabled={enviando}>
          {enviando ? 'Procurando…' : 'Continuar'}
        </button>
      </form>
    )
  }

  if (fase === 'cadastro') {
    return (
      <form
        className="identificacao"
        onSubmit={enviar((f) =>
          cadastrarCliente({
            telefone,
            nome: String(f.get('nome') ?? ''),
            endereco: modo === 'entrega' ? endereco(f) : undefined,
          }),
        )}
      >
        <p>
          Primeiro pedido com o telefone <strong>{telefone}</strong>.{' '}
          <button type="button" className="link" onClick={trocar}>
            Trocar
          </button>
        </p>
        <label>
          Seu nome
          <input name="nome" required maxLength={80} autoComplete="name" />
        </label>
        {modo === 'entrega' && <CamposEndereco />}
        {mensagemErro}
        <button className="secundario" disabled={enviando}>
          {enviando ? 'Salvando…' : 'Salvar cadastro'}
        </button>
      </form>
    )
  }

  return (
    <div className="identificacao">
      <p>
        Olá, <strong>{nome}</strong>!{' '}
        <button type="button" className="link" onClick={trocar}>
          Não é você?
        </button>
      </p>
      {modo === 'entrega' && (
        <>
          {enderecos.length > 0 && (
            <fieldset className="enderecos">
              <legend>Entregar em</legend>
              {enderecos.map((e) => (
                <label key={e.id}>
                  <input
                    type="radio"
                    name="enderecoId"
                    checked={escolhido === e.id}
                    onChange={() => escolher(e.id)}
                  />
                  {e.resumo}
                </label>
              ))}
            </fieldset>
          )}
          {novoEndereco || enderecos.length === 0 ? (
            <form onSubmit={enviar((f) => adicionarEndereco(telefone, endereco(f)))}>
              <CamposEndereco />
              {mensagemErro}
              <button className="secundario" disabled={enviando}>
                {enviando ? 'Salvando…' : 'Salvar endereço'}
              </button>
            </form>
          ) : (
            <button type="button" className="link" onClick={() => setNovoEndereco(true)}>
              + Adicionar endereço
            </button>
          )}
        </>
      )}
    </div>
  )
}
