'use client'

import { useState } from 'react'

import { salvarLoja } from '@/app/(frontend)/painel/actions'
import { Cardapio, type CategoriaView } from '@/components/Cardapio'
import { type Bairro, lerBairros } from '@/lib/entrega'
import { DIAS, type EnderecoLoja, type Horario, lerEndereco, lerHorario, montarEndereco, montarHorario } from '@/lib/lojaTexto'
import { FORMAS_PAGAMENTO, type FormaPagamento } from '@/lib/pedido'
import { COR_PADRAO, FONTES, temaDaLoja } from '@/lib/tema'

import { CampoComExemplo } from './CampoComExemplo'
import { CampoImagem } from './CampoImagem'
import { Formulario } from './Formulario'

export type DadosLoja = {
  nome: string
  slug: string
  whatsapp: string
  corPrincipal: string
  fonte: string
  horario: string
  endereco: string
  aberta: boolean
  fazEntrega: boolean
  taxaEntrega: number
  /** Um bairro por linha, "Centro = 5,00". */
  bairros: string
  /** Quantidade ou nomes das mesas, como o dono digitou. */
  mesas: string
  atendimentoMesas: string
  /** Taxa de serviço em %, como o dono digitou. */
  taxaServico: string
  pagamentos: FormaPagamento[]
  chavePix: string
  pixelMeta: string
  tagGoogle: string
  aceitaRetirada: boolean
  aceitaAgendamento: boolean
  logo: string | null
  capa: string | null
}

/** Na prévia, texto com erro simplesmente não mostra bairros; o erro aparece ao salvar. */
const bairrosDaPrevia = (texto: string): Bairro[] => {
  const r = lerBairros(texto)
  return r.ok ? r.bairros : []
}

const reais = (v: number) => v.toFixed(2).replace('.', ',')

/**
 * Dados da loja com a prévia do cardápio ao lado: cada mudança (nome, cor, fonte,
 * logo, capa, horário...) aparece na prévia antes de salvar.
 */
export function FormLoja({ loja, categorias }: { loja: DadosLoja; categorias: CategoriaView[] }) {
  const [d, setD] = useState(loja)
  // Horário e endereço guardados como texto: aqui viram campos de seleção e voltam a texto ao mudar.
  const lido = lerHorario(loja.horario)
  const horarioAntigo = Boolean(loja.horario) && !lido
  const [h, setH] = useState<Horario>(lido ?? { dias: [], abre: '', fecha: '' })
  const [e, setE] = useState<EnderecoLoja>(lerEndereco(loja.endereco))
  const mudaHorario = (novo: Horario) => {
    setH(novo)
    // Sem escolher nada, o horário antigo continua valendo (e aparecendo na prévia).
    setD((a) => ({ ...a, horario: montarHorario(novo) || (horarioAntigo ? loja.horario : '') }))
  }
  const mudaEndereco = (novo: EnderecoLoja) => {
    setE(novo)
    setD((a) => ({ ...a, endereco: montarEndereco(novo) }))
  }
  const muda = (campo: keyof DadosLoja) => (e: { target: HTMLInputElement | HTMLSelectElement }) =>
    setD((atual) => ({
      ...atual,
      [campo]:
        e.target instanceof HTMLInputElement && e.target.type === 'checkbox'
          ? e.target.checked
          : e.target.value,
    }))

  return (
    <div className="com-previa">
      <Formulario acao={salvarLoja}>
        <label className="campo">
          Nome da loja
          <input name="nome" value={d.nome} onChange={muda('nome')} required maxLength={80} />
        </label>
        <label className="campo">
          WhatsApp que recebe os pedidos
          <input
            name="whatsapp"
            type="tel"
            value={d.whatsapp}
            onChange={muda('whatsapp')}
            placeholder="(31) 99999-0000"
            required
          />
        </label>
        <div className="linha">
          <label className="campo">
            Cor principal
            <input
              name="corPrincipal"
              type="color"
              value={d.corPrincipal}
              onChange={muda('corPrincipal')}
            />
          </label>
          <label className="campo">
            Fonte dos títulos
            <select name="fonte" value={d.fonte} onChange={muda('fonte')}>
              {Object.entries(FONTES).map(([valor, f]) => (
                <option key={valor} value={valor}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <CampoImagem
          nome="logo"
          rotulo="Logo"
          atual={loja.logo}
          aoMudar={(logo) => setD((a) => ({ ...a, logo }))}
        />
        <CampoImagem
          nome="capa"
          rotulo="Foto de capa"
          atual={loja.capa}
          aoMudar={(capa) => setD((a) => ({ ...a, capa }))}
        />
        <fieldset className="campo">
          <legend>Horário de funcionamento</legend>
          <div className="dias">
            {DIAS.map((nome, i) => (
              <label key={nome} className="marcar">
                <input
                  type="checkbox"
                  name="dias"
                  value={i}
                  checked={h.dias.includes(i)}
                  onChange={(ev) =>
                    mudaHorario({ ...h, dias: ev.target.checked ? [...h.dias, i] : h.dias.filter((n) => n !== i) })
                  }
                />
                {nome}
              </label>
            ))}
          </div>
          <div className="linha">
            <label className="campo curto">
              Abre às
              <input type="time" name="abre" value={h.abre} onChange={(ev) => mudaHorario({ ...h, abre: ev.target.value })} />
            </label>
            <label className="campo curto">
              Fecha às
              <input type="time" name="fecha" value={h.fecha} onChange={(ev) => mudaHorario({ ...h, fecha: ev.target.value })} />
            </label>
          </div>
          {horarioAntigo && (
            <>
              <input type="hidden" name="horarioAntigo" value="1" />
              <small>
                Hoje o cardápio mostra &quot;{loja.horario}&quot;. Escolha os dias e as horas acima para trocar; se deixar em
                branco, esse texto continua.
              </small>
            </>
          )}
        </fieldset>
        <div className="linha">
          <label className="campo">
            Rua
            <input name="enderecoRua" value={e.rua} onChange={(ev) => mudaEndereco({ ...e, rua: ev.target.value })} maxLength={120} autoComplete="address-line1" />
          </label>
          <label className="campo curto">
            Número
            <input name="enderecoNumero" value={e.numero} onChange={(ev) => mudaEndereco({ ...e, numero: ev.target.value })} maxLength={10} />
          </label>
        </div>
        <div className="linha">
          <label className="campo">
            Bairro
            <input name="enderecoBairro" value={e.bairro} onChange={(ev) => mudaEndereco({ ...e, bairro: ev.target.value })} maxLength={60} />
          </label>
          <label className="campo">
            Cidade
            <input name="enderecoCidade" value={e.cidade} onChange={(ev) => mudaEndereco({ ...e, cidade: ev.target.value })} maxLength={60} autoComplete="address-level2" />
          </label>
        </div>
        <label className="marcar">
          <input type="checkbox" name="aberta" checked={d.aberta} onChange={muda('aberta')} />
          Recebendo pedidos agora (desmarque para pausar)
        </label>
        <div className="linha">
          <label className="marcar">
            <input
              type="checkbox"
              name="fazEntrega"
              checked={d.fazEntrega}
              onChange={muda('fazEntrega')}
            />
            Faz entrega
          </label>
          {d.fazEntrega && (
            <label className="campo curto">
              Taxa de entrega (R$)
              <input
                name="taxaEntrega"
                inputMode="decimal"
                defaultValue={reais(loja.taxaEntrega)}
                onChange={(e) =>
                  setD((a) => ({
                    ...a,
                    taxaEntrega: Number(e.target.value.replace(',', '.')) || 0,
                  }))
                }
              />
            </label>
          )}
          <label className="marcar">
            <input
              type="checkbox"
              name="aceitaRetirada"
              checked={d.aceitaRetirada}
              onChange={muda('aceitaRetirada')}
            />
            Aceita retirada
          </label>
        </div>
        <label className="campo">
          Mesas (opcional)
          <input name="mesas" value={d.mesas} onChange={muda('mesas')} placeholder="10 ou Varanda 1, Varanda 2" maxLength={600} />
          <small>
            Quantidade (10 vira as mesas 1 a 10) ou nomes separados por vírgula. Depois de salvar, imprima os QR Codes em
            Mesas.
          </small>
        </label>
        <label className="campo">
          Taxa de serviço das mesas (%)
          <input name="taxaServico" value={d.taxaServico} onChange={muda('taxaServico')} inputMode="decimal" placeholder="10" maxLength={5} />
          <small>
            Aparece ao fechar a conta, e o cliente pode dispensar. É gorjeta dos funcionários: o repasse é com o seu
            contador. Deixe vazio para não cobrar.
          </small>
        </label>
        <label className="campo">
          Atendimento das mesas
          <select name="atendimentoMesas" value={d.atendimentoMesas} onChange={muda('atendimentoMesas')}>
            <option value="ambos">Os dois: garçom e cliente pelo QR Code</option>
            <option value="garcom">Só com garçom</option>
            <option value="cliente">Sem garçom: o cliente pede pelo QR Code</option>
          </select>
          <small>Só com garçom: o QR Code mostra a conta, mas o cliente chama o garçom para pedir.</small>
        </label>
        <label className="marcar">
          <input
            type="checkbox"
            name="aceitaAgendamento"
            checked={d.aceitaAgendamento}
            onChange={muda('aceitaAgendamento')}
          />
          Aceita pedidos agendados (dia e hora, de 1 hora até 7 dias à frente)
        </label>
        {d.fazEntrega && (
          <CampoComExemplo
            name="bairros"
            rotulo="Taxa por bairro (opcional)"
            defaultValue={loja.bairros}
            exemplo={'Centro = 5,00\nSanta Efigênia = 8,00'}
            aoMudar={(bairros) => setD((a) => ({ ...a, bairros }))}
          >
            Um bairro por linha, com o valor depois do sinal de igual. Se preencher, a loja entrega
            só nesses bairros e a taxa única acima não é usada.
          </CampoComExemplo>
        )}
        <fieldset className="opcoes">
          <legend>Formas de pagamento aceitas</legend>
          {FORMAS_PAGAMENTO.map((f) => (
            <label key={f.value} className="marcar">
              <input
                type="checkbox"
                name="formasPagamento"
                value={f.value}
                checked={d.pagamentos.includes(f.value)}
                onChange={(e) =>
                  setD((a) => ({
                    ...a,
                    pagamentos: e.target.checked
                      ? [...a.pagamentos, f.value]
                      : a.pagamentos.filter((p) => p !== f.value),
                  }))
                }
              />
              {f.label}
            </label>
          ))}
        </fieldset>
        {d.pagamentos.includes('pix') && (
          <label className="campo">
            Chave Pix (o cliente copia para pagar)
            <input
              name="chavePix"
              value={d.chavePix}
              onChange={muda('chavePix')}
              required
              maxLength={100}
              placeholder="CNPJ, celular, e-mail ou chave aleatória"
            />
          </label>
        )}
        <fieldset className="campo">
          <legend>Anúncios (opcional)</legend>
          <div className="linha">
            <label className="campo">
              Pixel da Meta (Facebook/Instagram)
              <input
                name="pixelMeta"
                defaultValue={loja.pixelMeta}
                inputMode="numeric"
                maxLength={20}
                placeholder="123456789012345"
              />
            </label>
            <label className="campo">
              Tag do Google (Analytics ou Ads)
              <input
                name="tagGoogle"
                defaultValue={loja.tagGoogle}
                maxLength={22}
                placeholder="G-XXXXXXXXXX ou AW-XXXXXXXXXX"
              />
            </label>
          </div>
          <small>
            Com o código preenchido, o cardápio avisa a Meta e o Google das visitas e dos pedidos
            feitos, para você medir e criar anúncios.
          </small>
        </fieldset>
        <button className="botao">Salvar</button>
      </Formulario>

      <section className="previa" aria-label="Prévia do cardápio">
        <p className="vazio">Prévia: assim fica o seu cardápio (ainda não salvo).</p>
        <div
          className="previa__tela"
          inert
          style={temaDaLoja({ corPrincipal: d.corPrincipal || COR_PADRAO, fonte: d.fonte })}
        >
          <Cardapio
            loja={{
              slug: d.slug,
              nome: d.nome || 'Sua loja',
              logo: d.logo,
              capa: d.capa,
              horario: d.horario,
              endereco: d.endereco,
              aberta: d.aberta,
              fazEntrega: d.fazEntrega,
              aceitaRetirada: d.aceitaRetirada,
              aceitaAgendamento: d.aceitaAgendamento,
              taxaEntrega: d.taxaEntrega,
              bairros: bairrosDaPrevia(d.bairros),
              mesas: [],
              pedeNaMesa: true,
              pagamentos: d.pagamentos,
            }}
            categorias={categorias}
          />
        </div>
      </section>
    </div>
  )
}
