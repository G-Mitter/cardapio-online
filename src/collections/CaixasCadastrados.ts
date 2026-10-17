import type { CollectionConfig } from 'payload'

import { logado } from '../access/roles'

/**
 * Os caixas da loja (101, 102, Delivery...). Cada abertura de um deles é um registro em `caixas`.
 * Criado e ligado só pelo painel (/painel/caixa); o nome não repete dentro da mesma loja.
 */
export const CaixasCadastrados: CollectionConfig = {
  slug: 'caixas-cadastrados',
  labels: { singular: 'Caixa cadastrado', plural: 'Caixas cadastrados' },
  admin: { useAsTitle: 'nome', defaultColumns: ['nome', 'delivery', 'ativo'] },
  access: { read: logado, create: () => false, update: () => false, delete: logado },
  fields: [
    { name: 'nome', label: 'Nome ou número', type: 'text', required: true },
    {
      name: 'delivery',
      label: 'Caixa do delivery',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'O dinheiro do acerto dos entregadores entra neste caixa.' },
    },
    { name: 'ativo', label: 'Ativo', type: 'checkbox', defaultValue: true },
  ],
}
