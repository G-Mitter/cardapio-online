import type { CollectionConfig } from 'payload'

import { logado } from '../access/roles'

/**
 * Acerto do dinheiro de um entregador no dia: o que ele devia trazer, o que trouxe e a diferença.
 * Criado só pelo painel (fazerAcerto). Os pedidos do acerto guardam o que já foi conferido.
 */
export const Acertos: CollectionConfig = {
  slug: 'acertos',
  labels: { singular: 'Acerto de entregador', plural: 'Acertos de entregadores' },
  admin: { defaultColumns: ['entregador', 'dia', 'diferenca'] },
  access: { read: logado, create: () => false, update: () => false, delete: logado },
  fields: [
    { name: 'entregador', label: 'Entregador', type: 'relationship', relationTo: 'entregadores', required: true },
    // Dia do relatório (AAAA-MM-DD, horário de Brasília), pelo dia em que os pedidos foram feitos.
    { name: 'dia', label: 'Dia', type: 'text', required: true },
    { name: 'pedidos', label: 'Pedidos', type: 'relationship', relationTo: 'pedidos', hasMany: true },
    { name: 'dinheiro', label: 'Recebido em dinheiro (R$)', type: 'number', required: true },
    { name: 'cartao', label: 'Em cartão (R$)', type: 'number', defaultValue: 0 },
    { name: 'pix', label: 'Em Pix (R$)', type: 'number', defaultValue: 0 },
    { name: 'troco', label: 'Troco que levou (R$)', type: 'number', defaultValue: 0 },
    { name: 'taxas', label: 'Taxas de entrega (R$)', type: 'number', defaultValue: 0 },
    { name: 'descontouTaxa', label: 'Descontou a taxa do dinheiro', type: 'checkbox', defaultValue: false },
    { name: 'esperado', label: 'Esperado (R$)', type: 'number', required: true },
    { name: 'entregue', label: 'Entregou (R$)', type: 'number', required: true },
    { name: 'diferenca', label: 'Diferença (R$)', type: 'number', required: true },
    { name: 'conferidoPor', label: 'Conferido por', type: 'relationship', relationTo: 'users' },
  ],
}
