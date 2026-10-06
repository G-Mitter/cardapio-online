import type { CollectionConfig } from 'payload'

import { todos } from '../access/roles'

export const Produtos: CollectionConfig = {
  slug: 'produtos',
  labels: { singular: 'Produto', plural: 'Produtos' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'categoria', 'preco', 'esgotado'],
  },
  access: { read: todos },
  defaultSort: 'ordem',
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
