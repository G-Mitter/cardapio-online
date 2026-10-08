import type { CollectionConfig } from 'payload'

import { soAdmin, todos } from '../access/roles'
import { FORMAS_PAGAMENTO } from '../lib/pedido'
import { FONTES, corValida } from '../lib/tema'
import { whatsappUrl } from '../lib/whatsapp'
import { hooksDeCardapio } from '../lib/revalidar'

/**
 * Cada loja é um cliente seu. Tudo o que muda de um cliente para outro
 * (nome, cores, fonte, WhatsApp, horário, taxa) fica aqui, nunca no código.
 */
export const Lojas: CollectionConfig = {
  slug: 'lojas',
  labels: { singular: 'Loja', plural: 'Lojas' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'slug', 'whatsapp'],
  },
  access: {
    // O cardápio é público. Criar e apagar loja é só com você;
    // editar, o plugin libera para o dono daquela loja.
    read: todos,
    create: soAdmin,
    delete: soAdmin,
  },
  hooks: hooksDeCardapio,
  fields: [
    { name: 'nome', label: 'Nome da loja', type: 'text', required: true },
    {
      name: 'slug',
      label: 'Endereço do cardápio',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Só letras minúsculas, números e hífen. Ex.: cantina-dona-lurdes' },
      validate: (v: string | null | undefined) =>
        /^[a-z0-9]+(-[a-z0-9]+)*$/.test(v ?? '') || 'Use só letras minúsculas, números e hífen.',
    },
    {
      name: 'whatsapp',
      label: 'WhatsApp que recebe os pedidos',
      type: 'text',
      required: true,
      admin: { description: 'Com DDD. Ex.: (31) 99999-0000' },
      validate: (v: string | null | undefined) =>
        Boolean(whatsappUrl(v)) || 'Número incompleto. Coloque o DDD e o número.',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'corPrincipal',
          label: 'Cor principal',
          type: 'text',
          defaultValue: '#9a3b1e',
          admin: { description: 'Formato #rrggbb. Ex.: #9a3b1e' },
          validate: (v: string | null | undefined) =>
            !v || corValida(v) || 'Use o formato #rrggbb, por exemplo #9a3b1e.',
        },
        {
          name: 'fonte',
          label: 'Fonte dos títulos',
          type: 'select',
          defaultValue: 'classica',
          options: Object.entries(FONTES).map(([value, f]) => ({ value, label: f.label })),
        },
      ],
    },
    { name: 'logo', label: 'Logo', type: 'upload', relationTo: 'media' },
    {
      name: 'capa',
      label: 'Foto de capa',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Opcional. Foto larga (deitada) que aparece no topo do cardápio.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'horario',
          label: 'Horário',
          type: 'text',
          admin: { description: 'Ex.: 11h às 15h' },
        },
        { name: 'endereco', label: 'Endereço da loja', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'fazEntrega', label: 'Faz entrega', type: 'checkbox', defaultValue: true },
        {
          name: 'taxaEntrega',
          label: 'Taxa de entrega (R$)',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Vale quando não há bairros cadastrados abaixo.',
            condition: (data) => Boolean(data?.fazEntrega),
          },
        },
        { name: 'aceitaRetirada', label: 'Aceita retirada', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      name: 'aceitaAgendamento',
      label: 'Aceita pedidos agendados',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'O cliente pode escolher dia e hora (de 1 hora até 7 dias à frente).' },
    },
    {
      name: 'mesas',
      label: 'Mesas',
      type: 'text',
      admin: { description: 'Quantidade ("10" vira as mesas 1 a 10) ou nomes separados por vírgula. Cada mesa tem um QR Code no painel.' },
    },
    {
      name: 'atendimentoMesas',
      label: 'Atendimento das mesas',
      type: 'select',
      defaultValue: 'ambos',
      options: [
        { label: 'Os dois: garçom e cliente pelo QR Code', value: 'ambos' },
        { label: 'Só com garçom', value: 'garcom' },
        { label: 'Sem garçom: o cliente pede pelo QR Code', value: 'cliente' },
      ],
      admin: { condition: (data) => Boolean(data?.mesas) },
    },
    // Texto impresso embaixo de cada QR Code; vazio usa o texto padrão (INSTRUCOES_PADRAO em lib/mesas.ts).
    { name: 'instrucoesMesa', label: 'Instruções impressas no QR Code', type: 'textarea', maxLength: 400 },
    {
      name: 'bairros',
      label: 'Taxa por bairro',
      type: 'array',
      labels: { singular: 'Bairro', plural: 'Bairros' },
      admin: {
        description: 'Se tiver algum bairro aqui, a loja entrega só nestes, cada um com a sua taxa.',
        condition: (data) => Boolean(data?.fazEntrega),
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'nome', label: 'Bairro', type: 'text', required: true },
            { name: 'taxa', label: 'Taxa (R$)', type: 'number', min: 0, required: true },
          ],
        },
      ],
    },
    {
      name: 'formasPagamento',
      label: 'Formas de pagamento aceitas',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: FORMAS_PAGAMENTO.map((f) => f.value),
      options: [...FORMAS_PAGAMENTO],
      admin: { description: 'O cliente escolhe uma destas ao fazer o pedido.' },
    },
    {
      name: 'chavePix',
      label: 'Chave Pix',
      type: 'text',
      admin: {
        description: 'Aparece para o cliente copiar quando ele escolhe Pix.',
        condition: (data) => Boolean(data?.formasPagamento?.includes('pix')),
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'pixelMeta',
          label: 'Pixel da Meta (Facebook/Instagram)',
          type: 'text',
          admin: { description: 'Só os números do ID do Pixel. Opcional.' },
        },
        {
          name: 'tagGoogle',
          label: 'Tag do Google',
          type: 'text',
          admin: { description: 'G-XXXXXXXXXX (Analytics) ou AW-XXXXXXXXXX (Ads). Opcional.' },
        },
      ],
    },
    {
      name: 'aberta',
      label: 'Recebendo pedidos agora',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Desmarque para pausar os pedidos (o cardápio continua visível).' },
    },
  ],
}
