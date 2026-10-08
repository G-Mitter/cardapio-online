import type { CollectionConfig } from 'payload'

import { todos } from '../access/roles'
import { hooksDeCardapio } from '../lib/revalidar'

export const Categorias: CollectionConfig = {
  slug: 'categorias',
  labels: { singular: 'Categoria', plural: 'Categorias' },
  admin: { useAsTitle: 'nome', defaultColumns: ['nome', 'ordem'] },
  // Leitura pública (o cardápio). Criar e editar: o plugin libera para quem é da loja.
  access: { read: todos },
  defaultSort: 'ordem',
  hooks: hooksDeCardapio,
  fields: [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    {
      name: 'ordem',
      label: 'Ordem no cardápio',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Menor aparece primeiro.' },
    },
  ],
}
