import type { CollectionConfig } from 'payload'

import { todos } from '../access/roles'
import { hooksDeCardapio } from '../lib/revalidar'
import { SELOS } from '../lib/selos'

export const Produtos: CollectionConfig = {
  slug: 'produtos',
  labels: { singular: 'Produto', plural: 'Produtos' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'categoria', 'preco', 'esgotado'],
  },
  access: { read: todos },
  defaultSort: 'ordem',
  hooks: hooksDeCardapio,
  fields: [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: 'descricao', label: 'Descrição', type: 'textarea' },
    {
      type: 'row',
      fields: [
        { name: 'preco', label: 'Preço (R$)', type: 'number', required: true, min: 0 },
        {
          name: 'categoria',
          label: 'Categoria',
          type: 'relationship',
          relationTo: 'categorias',
          required: true,
        },
      ],
    },
    { name: 'foto', label: 'Foto', type: 'upload', relationTo: 'media' },
    {
      type: 'row',
      fields: [
        { name: 'leve', label: 'Promoção: leve', type: 'number', min: 2, admin: { description: 'Ex.: leve 3 e pague 2.' } },
        { name: 'pague', label: 'Promoção: pague', type: 'number', min: 1 },
      ],
    },
    {
      name: 'selos',
      label: 'Selos',
      type: 'select',
      hasMany: true,
      options: [...SELOS],
      admin: { description: 'Etiquetas que aparecem junto do nome no cardápio.' },
    },
    {
      name: 'opcoes',
      label: 'Opções e adicionais',
      type: 'array',
      labels: { singular: 'Grupo', plural: 'Grupos' },
      admin: { description: 'Ex.: Tamanho (escolha 1), Borda, Extras (até 3). O painel da loja edita isto em texto.' },
      fields: [
        { name: 'nome', label: 'Grupo', type: 'text', required: true },
        {
          type: 'row',
          fields: [
            { name: 'min', label: 'Mínimo de escolhas', type: 'number', min: 0, defaultValue: 0 },
            { name: 'max', label: 'Máximo de escolhas', type: 'number', min: 1, defaultValue: 1 },
          ],
        },
        {
          name: 'itens',
          label: 'Itens',
          type: 'array',
          required: true,
          minRows: 1,
          fields: [
            { name: 'nome', label: 'Item', type: 'text', required: true },
            { name: 'preco', label: 'Adicional (R$)', type: 'number', min: 0, defaultValue: 0 },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'esgotado',
          label: 'Esgotado',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Continua no cardápio, mas não dá para pedir.' },
        },
        { name: 'ordem', label: 'Ordem na categoria', type: 'number', defaultValue: 0 },
      ],
    },
  ],
}
