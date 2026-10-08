import type { CollectionConfig } from 'payload'

import { logado } from '../access/roles'
import { FORMAS_PAGAMENTO } from '../lib/pedido'

/**
 * Uma conta de mesa fechada: o que foi cobrado e como a mesa pagou. Criada só pelo painel
 * (fecharContaDaMesa); serve ao relatório por garçom e, depois, à conferência do caixa e da maquininha.
 */
export const Fechamentos: CollectionConfig = {
  slug: 'fechamentos',
  labels: { singular: 'Conta de mesa fechada', plural: 'Contas de mesa fechadas' },
  admin: { defaultColumns: ['mesa', 'total', 'createdAt'] },
  access: { read: logado, create: () => false, update: () => false, delete: logado },
  fields: [
    { name: 'mesa', label: 'Mesa', type: 'text', required: true },
    { name: 'pedidos', label: 'Pedidos', type: 'relationship', relationTo: 'pedidos', hasMany: true },
    { name: 'subtotal', label: 'Subtotal (R$)', type: 'number', required: true },
    { name: 'taxaServico', label: 'Taxa de serviço (R$)', type: 'number', defaultValue: 0 },
    { name: 'total', label: 'Total (R$)', type: 'number', required: true },
    {
      name: 'pagamentos',
      label: 'Pagamentos',
      type: 'array',
      fields: [
        { name: 'forma', label: 'Forma', type: 'select', options: [...FORMAS_PAGAMENTO], required: true },
        { name: 'valor', label: 'Valor (R$)', type: 'number', required: true },
      ],
    },
    { name: 'troco', label: 'Troco dado (R$)', type: 'number', defaultValue: 0 },
    // Garçom da conta: quem fechou, se for garçom; senão quem lançou o primeiro pedido dele.
    { name: 'garcom', label: 'Garçom', type: 'relationship', relationTo: 'users' },
    { name: 'fechadoPor', label: 'Fechada por', type: 'relationship', relationTo: 'users' },
  ],
}
