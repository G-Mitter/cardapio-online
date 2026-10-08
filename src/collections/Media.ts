import type { CollectionConfig } from 'payload'

import { todos } from '../access/roles'

export const textoDoArquivo = (arquivo?: string | null) => {
  const t = (arquivo ?? '')
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .trim()
  return t.charAt(0).toUpperCase() + t.slice(1)
}

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Imagem', plural: 'Imagens' },
  access: { read: todos },
  fields: [
    {
      name: 'alt',
      label: 'Texto alternativo (descreve a imagem para leitores de tela)',
      type: 'text',
      admin: { description: 'Opcional. Em branco, usamos o nome do arquivo.' },
      hooks: {
        // "vaca-atolada.jpg" vira "Vaca atolada".
        beforeChange: [
          ({ value, data, req }) =>
            value?.trim() || textoDoArquivo(req.file?.name ?? data?.filename),
        ],
      },
    },
  ],
  upload: {
    // Só imagens. Bloqueia, por exemplo, um .html ou .svg com código escondido
    // que rodaria ao ser aberto pelo endereço do site.
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/avif'],
  },
}
