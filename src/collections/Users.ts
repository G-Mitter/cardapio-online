import type { CollectionConfig } from 'payload'

import { ehAdmin, logado, soAdmin } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Usuário', plural: 'Usuários' },
  admin: {
    useAsTitle: 'email',
    // O dono da loja não precisa ver a lista de usuários.
    hidden: ({ user }) => !ehAdmin(user),
  },
  // O garçom entra com usuário e senha (sem e-mail); você e os donos continuam com e-mail.
  // requireUsername: false para não exigir usuário de quem já existe.
  auth: { loginWithUsername: { allowEmailLogin: true, requireEmail: false, requireUsername: false } },
  access: {
    // O /admin é só seu. O dono da loja usa o painel próprio, em /painel.
    admin: ({ req: { user } }) => ehAdmin(user),
    // Só você cria e apaga usuários. O plugin já limita a leitura e a edição
    // ao próprio usuário e às lojas dele.
    create: soAdmin,
    delete: soAdmin,
    read: logado,
    // Cada um edita só o próprio usuário (senha, e-mail); você edita todos.
    update: ({ req: { user } }) =>
      ehAdmin(user) || (user ? { id: { equals: user.id } } : false),
  },
  // O e-mail e a senha o Payload cria sozinho (auth: true).
  // A lista de lojas do usuário ("tenants") o plugin de multi-cliente adiciona.
  fields: [
    {
      name: 'roles',
      label: 'Tipo de usuário',
      type: 'select',
      hasMany: true,
      defaultValue: ['loja'],
      required: true,
      saveToJWT: true,
      options: [
        { label: 'Administrador geral', value: 'admin' },
        { label: 'Dono de loja', value: 'loja' },
        { label: 'Garçom', value: 'garcom' },
      ],
      // Ninguém se promove a administrador: só um admin muda este campo.
      access: {
        create: ({ req: { user } }) => ehAdmin(user),
        update: ({ req: { user } }) => ehAdmin(user),
      },
    },
    // Garçom: a loja dele. Fica fora da lista "tenants" de propósito: sem ela o plugin de
    // multi-cliente não dá a ele acesso a nenhum dado pela API; o painel lê pelo servidor.
    {
      name: 'lojaDoGarcom',
      label: 'Loja do garçom',
      type: 'relationship',
      relationTo: 'lojas',
      access: { create: ({ req: { user } }) => ehAdmin(user), update: ({ req: { user } }) => ehAdmin(user) },
    },
    { name: 'nome', label: 'Nome', type: 'text' },
    // Desligado não entra mais (nem com a sessão que já estava aberta). Não se apaga, para o relatório.
    { name: 'ativo', label: 'Ativo', type: 'checkbox', defaultValue: true },
  ],
}
