import Script from 'next/script'

import { scriptGoogle, scriptMeta } from '@/lib/pixel'

/** Carrega os pixels de anúncios que a loja cadastrou; sem código cadastrado, não carrega nada. */
export function Pixels({ meta, google }: { meta?: string | null; google?: string | null }) {
  return (
    <>
      {meta && (
        <Script id="pixel-meta" strategy="afterInteractive">
          {scriptMeta(meta)}
        </Script>
      )}
      {google && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(google)}`}
            strategy="afterInteractive"
          />
          <Script id="pixel-google" strategy="afterInteractive">
            {scriptGoogle(google)}
          </Script>
        </>
      )}
    </>
  )
}
