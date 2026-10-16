import type { CollectionConfig } from 'payload'

import { logado } from '../access/roles'
import { MOVIMENTOS } from '../lib/caixa'

/**
 * Caixa do dia: abre com o troco, recebe sangrias e suprimentos e fecha com o dinheiro contado.
 * Criado e fechado só pelo painel (/painel/caixa); as contas ficam em src/lib/caixa.ts.
 * Sem `fechadoEm`, o caixa está aberto (um por loja).
 */
export const Caixas: CollectionConfig = {
  slug: 'caixas',
  labels: { singular: 'Caixa', plural: 'Caixas' },
  admin: { defaultColumns: ['abertoEm', 'fechadoEm', 'esperado', 'contado', 'diferenca'] },
  defaultSort: '-abertoEm',
  access: { read: logado, create: () => false, update: () => false, delete: logado },
  fields: [
    { name: 'abertoEm', label: 'Aberto em', type: 'date', required: true, index: true },
    { name: 'trocoInicial', label: 'Troco inicial (R$)', type: 'number', required: true, min: 0 },
    {
      name: 'movimentos',
      label: 'Sangrias e suprimentos',
      type: 'array',
      fields: [
        { name: 'tipo', label: 'Tipo', type: 'select', required: true, options: MOVIMENTOS.map((m) => ({ label: m.label, value: m.value })) },
        { name: 'valor', label: 'Valor (R$)', type: 'number', required: true, min: 0 },
        { name: 'motivo', label: 'Motivo', type: 'text', required: true },
        { name: 'em', label: 'Quando', type: 'date', required: true },
      ],
    },
    { name: 'fechadoEm', label: 'Fechado em', type: 'date', index: true },
    // Gravados ao fechar: o que o sistema esperava, o que foi contado e a diferença (negativo = faltou).
    { name: 'esperado', label: 'Esperado em dinheiro (R$)', type: 'number' },
    { name: 'contado', label: 'Contado em dinheiro (R$)', type: 'number' },
    { name: 'diferenca', label: 'Diferença (R$)', type: 'number' },
    { name: 'observacao', label: 'Observação', type: 'textarea' },
    { name: 'abertoPor', label: 'Aberto por', type: 'relationship', relationTo: 'users' },
    { name: 'fechadoPor', label: 'Fechado por', type: 'relationship', relationTo: 'users' },
  ],
}
