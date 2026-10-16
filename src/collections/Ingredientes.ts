import type { CollectionConfig } from 'payload'

import { logado } from '../access/roles'
import { UNIDADES } from '../lib/estoque'

/**
 * Ingredientes do estoque da loja. O painel (actions.ts) cadastra, dá entrada e ajusta a contagem.
 * A quantidade pode ficar negativa: o estoque nunca barra um pedido, só avisa que acabou.
 */
export const Ingredientes: CollectionConfig = {
  slug: 'ingredientes',
  labels: { singular: 'Ingrediente', plural: 'Ingredientes' },
  admin: { useAsTitle: 'nome', defaultColumns: ['nome', 'quantidade', 'unidade', 'minimo'] },
  access: { read: logado, create: logado, update: logado, delete: logado },
  defaultSort: 'nome',
  fields: [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'unidade', label: 'Unidade', type: 'select', defaultValue: 'un', required: true, options: UNIDADES.map((u) => ({ label: u.rotulo, value: u.valor })) },
        { name: 'quantidade', label: 'Quantidade em estoque', type: 'number', defaultValue: 0, required: true },
        { name: 'minimo', label: 'Avisar quando chegar a', type: 'number', defaultValue: 0, min: 0, required: true },
      ],
    },
    // Quanto custa uma unidade (um kg, um litro...) em reais; vazio = a loja ainda não informou.
    { name: 'custo', label: 'Custo por unidade (R$)', type: 'number', min: 0 },
  ],
}
