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
  auth: true,
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
      ],
      // Ninguém se promove a administrador: só um admin muda este campo.
      access: {
        create: ({ req: { user } }) => ehAdmin(user),
        update: ({ req: { user } }) => ehAdmin(user),
      },
    },
  ],
}
