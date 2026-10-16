import type { CollectionConfig } from 'payload'

import { logado } from '../access/roles'

/**
 * Compra de ingredientes de um fornecedor. Criada só pelo painel (registrarCompra), que também soma
 * no estoque, atualiza o custo do ingrediente e cria a conta a pagar (campo `lancamento`).
 */
export const Compras: CollectionConfig = {
  slug: 'compras',
  labels: { singular: 'Compra', plural: 'Compras' },
  admin: { defaultColumns: ['data', 'fornecedor', 'total', 'aVista'] },
  defaultSort: '-data',
  access: { read: logado, create: () => false, update: () => false, delete: logado },
  fields: [
    { name: 'fornecedor', label: 'Fornecedor', type: 'relationship', relationTo: 'fornecedores', required: true },
    { name: 'data', label: 'Data da compra (AAAA-MM-DD)', type: 'text', required: true, index: true },
    {
      name: 'itens',
      label: 'Itens',
      type: 'array',
      required: true,
      fields: [
        { name: 'ingrediente', label: 'Ingrediente', type: 'relationship', relationTo: 'ingredientes', required: true },
        { name: 'quantidade', label: 'Quantidade', type: 'number', required: true },
        { name: 'total', label: 'Pago pelo item (R$)', type: 'number', required: true },
        { name: 'custo', label: 'Custo por unidade (R$)', type: 'number', required: true },
      ],
    },
    { name: 'total', label: 'Total (R$)', type: 'number', required: true },
    { name: 'aVista', label: 'Pago na hora', type: 'checkbox', defaultValue: false },
    { name: 'vencimento', label: 'Vencimento (AAAA-MM-DD)', type: 'text' },
    { name: 'lancamento', label: 'Conta a pagar', type: 'relationship', relationTo: 'lancamentos' },
    { name: 'observacao', label: 'Observação', type: 'textarea' },
  ],
}
