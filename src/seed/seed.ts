/**
 * Script de "seed": cria o administrador e a loja de demonstração
 * (Cantina Dona Lurdes, restaurante fictício usado como piloto).
 *
 * Rodar com:  pnpm seed
 * Login criado: o e-mail e a senha das variáveis SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD.
 *
 * Pode rodar várias vezes: se a loja já existe, não cria de novo.
 */
import { getPayload } from 'payload'

import config from '../payload.config'

const cardapio: Record<string, [string, string, number, boolean?][]> = {
  'Pratos do dia': [
    ['Feijão tropeiro', 'Feijão, farinha, torresmo, couve e ovo', 32.9],
    ['Frango com quiabo', 'Com angu e arroz branco', 34.9],
    ['Vaca atolada', 'Costela com mandioca cozida', 39.9, true],
  ],
  Porções: [
    ['Torresmo de barriga', '500 g, com limão', 29.9],
    ['Pão de queijo', '10 unidades', 14],
  ],
  Bebidas: [
    ['Suco de laranja', '500 ml', 9],
    ['Refrigerante lata', '350 ml', 6],
  ],
}

const payload = await getPayload({ config })

const email = process.env.SEED_ADMIN_EMAIL
const password = process.env.SEED_ADMIN_PASSWORD
if (email && password) {
  const existe = await payload.count({ collection: 'users', where: { email: { equals: email } } })
  if (!existe.totalDocs) {
    await payload.create({ collection: 'users', data: { email, password, roles: ['admin'] } })
    payload.logger.info(`Administrador criado: ${email}`)
  }
} else {
  payload.logger.warn('SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD vazios: administrador não criado.')
}

const slug = 'cantina-dona-lurdes'
const jaTem = await payload.count({ collection: 'lojas', where: { slug: { equals: slug } } })
if (jaTem.totalDocs) {
  payload.logger.info('Loja de demonstração já existe.')
} else {
  const loja = await payload.create({
    collection: 'lojas',
    data: {
      nome: 'Cantina Dona Lurdes',
      slug,
      whatsapp: '(31) 99999-0000',
      corPrincipal: '#9a3b1e',
      fonte: 'classica',
      horario: '11h às 15h',
      endereco: 'Rua dos Timbiras, 1200, Belo Horizonte',
      fazEntrega: true,
      taxaEntrega: 6,
      aceitaRetirada: true,
      aberta: true,
    },
  })

  let ordemCategoria = 0
  for (const [nomeCategoria, produtos] of Object.entries(cardapio)) {
    const categoria = await payload.create({
      collection: 'categorias',
      data: { nome: nomeCategoria, ordem: ordemCategoria++, loja: loja.id },
    })
    let ordem = 0
    for (const [nome, descricao, preco, esgotado] of produtos) {
      await payload.create({
        collection: 'produtos',
        data: {
          nome,
          descricao,
          preco,
          esgotado: Boolean(esgotado),
          ordem: ordem++,
          categoria: categoria.id,
          loja: loja.id,
        },
      })
    }
  }
  payload.logger.info(`Loja de demonstração criada: /${slug}`)
}

process.exit(0)
