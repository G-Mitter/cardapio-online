import type { CollectionConfig } from 'payload'

import { logado } from '../access/roles'

/**
 * Cupons de desconto da loja. Quem confere e dá baixa é o servidor (actions.ts);
 * as regras ficam em src/lib/cupom.ts. Não é público: o cliente só descobre o código que digitar.
 */
export const Cupons: CollectionConfig = {
  slug: 'cupons',
  labels: { singular: 'Cupom', plural: 'Cupons' },
  admin: { useAsTitle: 'codigo', defaultColumns: ['codigo', 'tipo', 'valor', 'validoAte', 'usos'] },
  access: { read: logado, create: logado, update: logado, delete: logado },
  fields: [
    { name: 'codigo', label: 'Código', type: 'text', required: true, index: true },
    {
      type: 'row',
      fields: [
        {
          name: 'tipo',
          label: 'Tipo',
          type: 'select',
          defaultValue: 'porcentagem',
          required: true,
          options: [
            { label: 'Porcentagem (%)', value: 'porcentagem' },
            { label: 'Valor fixo (R$)', value: 'valor' },
          ],
        },
        { name: 'valor', label: 'Valor', type: 'number', required: true, min: 0 },
        { name: 'minimo', label: 'Pedido mínimo (R$)', type: 'number', min: 0 },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'validoAte', label: 'Vale até', type: 'date' },
        { name: 'limiteUso', label: 'Limite de usos', type: 'number', min: 1 },
        { name: 'usos', label: 'Já usado', type: 'number', defaultValue: 0, admin: { readOnly: true } },
      ],
    },
    { name: 'ativo', label: 'Ativo', type: 'checkbox', defaultValue: true },
  ],
}
