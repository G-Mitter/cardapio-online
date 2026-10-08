import type { CollectionConfig } from 'payload'

import { logado } from '../access/roles'
import { FORMAS_PAGAMENTO } from '../lib/pedido'

/**
 * Pedidos feitos pelo cardápio. Quem cria é o servidor (actions.ts), que
 * recalcula preços e total; pela API ninguém cria pedido direto.
 */
export const Pedidos: CollectionConfig = {
  slug: 'pedidos',
  labels: { singular: 'Pedido', plural: 'Pedidos' },
  admin: {
    useAsTitle: 'numero',
    defaultColumns: ['numero', 'nome', 'total', 'modo', 'status', 'createdAt'],
  },
  defaultSort: '-createdAt',
  access: {
    create: () => false,
    read: logado,
    update: logado,
    delete: logado,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'numero', label: 'Nº', type: 'number', required: true, admin: { readOnly: true } },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          defaultValue: 'novo',
          required: true,
          options: [
            { label: 'Novo', value: 'novo' },
            { label: 'Preparando', value: 'preparando' },
            { label: 'Saiu para entrega / pronto', value: 'pronto' },
            { label: 'Entregue', value: 'entregue' },
            { label: 'Cancelado', value: 'cancelado' },
          ],
        },
      ],
    },
    {
      name: 'itens',
      label: 'Itens',
      type: 'array',
      required: true,
      admin: { readOnly: true },
      fields: [
        { name: 'nome', label: 'Produto', type: 'text', required: true },
        // Opções escolhidas ("Grande, Borda catupiry"); o preço unitário já inclui os adicionais.
        { name: 'opcoes', label: 'Opções', type: 'text' },
        // Para "Repetir pedido": qual produto e quais opções (ids do cardápio na hora do pedido).
        { name: 'produto', label: 'Id do produto', type: 'number', admin: { hidden: true } },
        { name: 'escolhas', label: 'Escolhas', type: 'json', admin: { hidden: true } },
        { name: 'quantidade', label: 'Qtd.', type: 'number', required: true },
        { name: 'precoUnitario', label: 'Preço unitário (R$)', type: 'number', required: true },
      ],
    },
    {
      type: 'row',
      admin: { readOnly: true },
      fields: [
        { name: 'subtotal', label: 'Subtotal (R$)', type: 'number', required: true },
        { name: 'taxa', label: 'Entrega (R$)', type: 'number', required: true },
        { name: 'total', label: 'Total (R$)', type: 'number', required: true },
      ],
    },
    {
      type: 'row',
      admin: { readOnly: true },
      fields: [
        {
          name: 'modo',
          label: 'Entrega ou retirada',
          type: 'select',
          required: true,
          options: [
            { label: 'Entrega', value: 'entrega' },
            { label: 'Retirada', value: 'retirada' },
          ],
        },
        { name: 'nome', label: 'Cliente', type: 'text', required: true },
        { name: 'telefone', label: 'Telefone', type: 'text' },
        // Só na retirada: o cliente mostra o código e a loja digita para marcar Entregue.
        { name: 'codigoRetirada', label: 'Código de retirada', type: 'text' },
      ],
    },
    { name: 'endereco', label: 'Endereço', type: 'text', admin: { readOnly: true } },
    {
      type: 'row',
      admin: { readOnly: true },
      fields: [
        { name: 'pagamento', label: 'Pagamento', type: 'select', options: [...FORMAS_PAGAMENTO] },
        { name: 'trocoPara', label: 'Troco para (R$)', type: 'number' },
        // Só neste pedido e só para esta loja: o CPF não fica no cadastro do cliente.
        { name: 'cpf', label: 'CPF na nota', type: 'text' },
      ],
    },
    { name: 'observacoes', label: 'Observações', type: 'textarea', admin: { readOnly: true } },
  ],
}
