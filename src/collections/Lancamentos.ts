import type { CollectionConfig } from 'payload'

import { logado } from '../access/roles'
import { CATEGORIAS, TIPOS } from '../lib/financeiro'

/**
 * Contas a pagar e a receber da loja. O painel (/painel/financeiro) cria, dá baixa e apaga;
 * as datas são texto AAAA-MM-DD e as regras ficam em src/lib/financeiro.ts.
 */
export const Lancamentos: CollectionConfig = {
  slug: 'lancamentos',
  labels: { singular: 'Conta a pagar ou receber', plural: 'Contas a pagar e a receber' },
  admin: { useAsTitle: 'descricao', defaultColumns: ['descricao', 'tipo', 'valor', 'vencimento', 'pagoEm'] },
  access: { read: logado, create: logado, update: logado, delete: logado },
  fields: [
    {
      name: 'tipo',
      label: 'Tipo',
      type: 'select',
      required: true,
      options: TIPOS.map((t) => ({ label: t.label, value: t.value })),
    },
    { name: 'descricao', label: 'Descrição', type: 'text', required: true },
    { name: 'valor', label: 'Valor (R$)', type: 'number', required: true, min: 0 },
    { name: 'vencimento', label: 'Vencimento (AAAA-MM-DD)', type: 'text', required: true, index: true },
    { name: 'categoria', label: 'Categoria', type: 'select', options: CATEGORIAS.map((c) => ({ label: c, value: c })) },
    { name: 'observacao', label: 'Observação', type: 'textarea' },
    // Conta fixa: ao dar baixa, nasce a do mês seguinte, no mesmo dia (diaDoMes guarda o dia original).
    { name: 'repetir', label: 'Repetir todo mês', type: 'checkbox', defaultValue: false },
    { name: 'diaDoMes', label: 'Dia do mês', type: 'number', admin: { hidden: true } },
    { name: 'pagoEm', label: 'Pago ou recebido em (AAAA-MM-DD)', type: 'text', index: true },
    { name: 'valorPago', label: 'Valor pago ou recebido (R$)', type: 'number' },
  ],
}
