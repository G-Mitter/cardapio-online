import { postgresAdapter } from '@payloadcms/db-postgres'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { pt } from '@payloadcms/translations/languages/pt'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { ehAdmin } from './access/roles'
import { Categorias } from './collections/Categorias'
import { Lojas } from './collections/Lojas'
import { Media } from './collections/Media'
import { Pedidos } from './collections/Pedidos'
import { Produtos } from './collections/Produtos'
import { Users } from './collections/Users'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    // Prévia do cardápio ao lado do formulário da loja: muda enquanto o dono edita.
    livePreview: {
      collections: ['lojas'],
      url: ({ data, req }) => {
        const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
        const protocolo = req.headers.get('x-forwarded-proto') ?? 'http'
        return data?.slug ? `${protocolo}://${host}/${data.slug}` : ''
      },
      breakpoints: [{ label: 'Celular', name: 'celular', width: 390, height: 844 }],
    },
  },
  collections: [Pedidos, Produtos, Categorias, Lojas, Media, Users],
  // Painel /admin em português
  i18n: {
    supportedLanguages: { pt },
    fallbackLanguage: 'pt',
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // Em desenvolvimento o Payload ajusta as tabelas sozinho ("push").
    // Em produção isso é perigoso (pode apagar dados), então usamos migrations:
    // arquivos em src/migrations com os comandos SQL, versionados no Git,
    // que rodam automaticamente quando o site sobe.
    // Mudou uma coleção? Rode `pnpm payload migrate:create nome-da-mudanca`.
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [
    // Vários clientes num sistema só: cada produto, categoria, pedido e imagem
    // ganha um campo "loja", e o dono de uma loja só enxerga o que é dela.
    // No modelo "venda do sistema" a instalação tem uma loja só, e nada muda no código.
    multiTenantPlugin({
      tenantsSlug: 'lojas',
      tenantField: { name: 'loja' },
      collections: {
        produtos: {},
        categorias: {},
        pedidos: {},
        media: {},
      },
      userHasAccessToAllTenants: (user) => ehAdmin(user),
      i18n: {
        translations: {
          pt: {
            'nav-tenantSelector-label': 'Loja',
            'field-assignedTenant-label': 'Loja',
            'assign-tenant-button-label': 'Mudar de loja',
            'assign-tenant-modal-title': 'Mudar "{{title}}" de loja',
          },
        },
      },
    }),
    // O plugin cria nos usuários a lista "tenants" sem rótulo; aqui ela vira "Lojas".
    (config) => {
      const tenants = config.collections
        ?.find((c) => c.slug === 'users')
        ?.fields.find((f) => 'name' in f && f.name === 'tenants')
      if (tenants?.type === 'array') {
        tenants.label = 'Lojas'
        tenants.labels = { singular: 'Loja', plural: 'Lojas' }
        tenants.fields.forEach((f) => 'name' in f && f.name === 'tenant' && (f.label = 'Loja'))
      }
      return config
    },
    // Onde as imagens enviadas pelo /admin ficam guardadas.
    // Na Vercel o disco do servidor é apagado a cada deploy, então em produção
    // os arquivos vão para o Vercel Blob (um "HD na nuvem").
    // Sem a variável BLOB_READ_WRITE_TOKEN (no seu computador), as imagens vão para a pasta media/.
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      token: process.env.BLOB_READ_WRITE_TOKEN,
      collections: { media: true },
      // Cria as mesmas colunas no banco com o plugin ligado ou desligado.
      alwaysInsertFields: true,
      // O navegador envia a imagem direto para o Blob (sem o limite de 4,5 MB das funções da Vercel).
      clientUploads: true,
    }),
  ],
})
