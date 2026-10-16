import type { CollectionConfig } from 'payload'

import { logado } from '../access/roles'

/**
 * Consentimento de um cliente para receber promoções desta loja (LGPD).
 * Só existe linha para quem a loja marcou em /painel/clientes; sem linha, não aceitou.
 */
export const Contatos: CollectionConfig = {
  slug: 'contatos',
  labels: { singular: 'Contato', plural: 'Contatos' },
  admin: { useAsTitle: 'telefone', defaultColumns: ['telefone', 'aceitaPromocoes', 'aceitouEm'] },
  access: { read: logado, create: logado, update: logado, delete: logado },
  fields: [
    { name: 'telefone', label: 'Telefone', type: 'text', required: true, index: true },
    { name: 'aceitaPromocoes', label: 'Aceita receber promoções', type: 'checkbox', defaultValue: false },
    { name: 'aceitouEm', label: 'Marcado em', type: 'date', admin: { readOnly: true } },
  ],
}
