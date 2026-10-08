import type { CollectionConfig } from 'payload'

import { soAdmin } from '../access/roles'
import { normalizarTelefone } from '../lib/cliente'

/**
 * Cliente final (quem faz o pedido). Um cadastro só, pelo telefone, que vale em
 * todas as lojas do sistema: por isso não tem campo "loja" nem passa pelo plugin.
 *
 * Ninguém acessa pela API. Quem lê e grava é o servidor do cardápio
 * (src/app/(frontend)/cliente-actions.ts), que só devolve dados escondidos.
 */
export const Clientes: CollectionConfig = {
  slug: 'clientes',
  labels: { singular: 'Cliente', plural: 'Clientes' },
  admin: { useAsTitle: 'nome', defaultColumns: ['nome', 'telefone', 'createdAt'] },
  access: {
    create: () => false,
    read: soAdmin,
    update: soAdmin,
    delete: soAdmin,
  },
  fields: [
    {
      name: 'telefone',
      label: 'Telefone',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Só DDD + número, sem 55. Ex.: 31999990000' },
      validate: (v: string | null | undefined) =>
        normalizarTelefone(v) === v || 'Use só DDD + número, sem espaços. Ex.: 31999990000',
    },
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    {
      name: 'enderecos',
      label: 'Endereços',
      type: 'array',
      labels: { singular: 'Endereço', plural: 'Endereços' },
      fields: [
        { name: 'rua', label: 'Rua e número', type: 'text', required: true },
        {
          type: 'row',
          fields: [
            { name: 'complemento', label: 'Complemento', type: 'text' },
            { name: 'bairro', label: 'Bairro', type: 'text', required: true },
          ],
        },
      ],
    },
  ],
}
