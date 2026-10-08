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
          admin: { condition: (data) => Boolean(data?.fazEntrega) },
        },
        { name: 'aceitaRetirada', label: 'Aceita retirada', type: 'checkbox', defaultValue: true },
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
      name: 'aberta',
      label: 'Recebendo pedidos agora',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Desmarque para pausar os pedidos (o cardápio continua visível).' },
    },
  ],
}
