import type { CollectionConfig } from 'payload'

import { logado } from '../access/roles'

/** Quem vende para a loja. O painel (/painel/compras) cadastra, edita e apaga; não apaga quem já tem compra. */
export const Fornecedores: CollectionConfig = {
  slug: 'fornecedores',
  labels: { singular: 'Fornecedor', plural: 'Fornecedores' },
  admin: { useAsTitle: 'nome', defaultColumns: ['nome', 'telefone'] },
  defaultSort: 'nome',
  access: { read: logado, create: logado, update: logado, delete: logado },
  fields: [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: 'telefone', label: 'Telefone', type: 'text' },
    { name: 'observacao', label: 'Observação', type: 'textarea' },
  ],
}
