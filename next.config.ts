import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
    // Fotos guardadas no Vercel Blob (em produção).
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  // Cabeçalhos de segurança enviados em todas as páginas:
  // - nosniff: o navegador não "adivinha" o tipo de um arquivo (ex.: tratar uma imagem como script);
  // - SAMEORIGIN: outro site não consegue abrir o seu dentro de um iframe (golpe de clique falso);
  // - Referrer-Policy: ao clicar num link externo, só o domínio é enviado, não a página inteira;
  // - Permissions-Policy: o site não pede câmera, microfone nem localização.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
  // Fotos do painel da loja vão por Server Action. O navegador já reduz cada uma
  // (src/components/painel/CampoImagem.tsx); o limite cobre logo + capa juntos,
  // abaixo dos 4,5 MB que a Vercel aceita por requisição.
  experimental: {
    serverActions: { bodySizeLimit: '4mb' },
  },
  // As planilhas de exemplo são lidas do disco pela importação (src/lib/exemplo-db.ts): vão junto na Vercel.
  outputFileTracingIncludes: { '/painel/exemplo': ['./src/seed/exemplo/**/*'] },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
