import type { CollectionConfig } from 'payload'

import { logado } from '../access/roles'

/**
 * Carrinhos de quem se identificou com o telefone e não finalizou o pedido.
 * Um por telefone em cada loja; some quando o pedido é feito ou depois de 7 dias.
 * Quem grava é o servidor (actions.ts); a loja só lista e chama no WhatsApp.
 */
export const Carrinhos: CollectionConfig = {
  slug: 'carrinhos',
  labels: { singular: 'Carrinho abandonado', plural: 'Carrinhos abandonados' },
  admin: { useAsTitle: 'nome', defaultColumns: ['nome', 'telefone', 'total', 'updatedAt'] },
  access: { create: () => false, read: logado, update: () => false, delete: logado },
  fields: [
    { name: 'telefone', label: 'Telefone', type: 'text', required: true, index: true },
    { name: 'nome', label: 'Cliente', type: 'text', required: true },
    { name: 'resumo', label: 'Itens', type: 'textarea', required: true },
    { name: 'total', label: 'Total dos itens (R$)', type: 'number', required: true },
  ],
}
