import type { CollectionConfig } from 'payload'

import { logado } from '../access/roles'

/**
 * Entregadores da loja. O painel (actions.ts) cadastra e liga/desliga; o pedido guarda quem entregou.
 * Não se apaga: o relatório do dia precisa do nome de quem já entregou.
 */
export const Entregadores: CollectionConfig = {
  slug: 'entregadores',
  labels: { singular: 'Entregador', plural: 'Entregadores' },
  admin: { useAsTitle: 'nome', defaultColumns: ['nome', 'whatsapp', 'ativo'] },
  access: { read: logado, create: logado, update: logado, delete: logado },
  fields: [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: 'whatsapp', label: 'WhatsApp', type: 'text', required: true },
    { name: 'ativo', label: 'Ativo', type: 'checkbox', defaultValue: true },
  ],
}
