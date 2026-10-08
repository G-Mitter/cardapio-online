/**
 * Pixels de anúncios da loja: Meta (Facebook/Instagram) e Google.
 * Os códigos entram em <script>, então só passam se tiverem exatamente o formato esperado.
 */

/** ID do Pixel da Meta: só números. */
export function lerPixelMeta(
  v: string | null | undefined,
): { ok: true; id: string } | { ok: false; erro: string } {
  const id = (v ?? '').trim()
  return /^(\d{8,20})?$/.test(id)
    ? { ok: true, id }
    : {
        ok: false,
        erro: 'Pixel da Meta inválido. Use só os números do ID, por exemplo 123456789012345.',
      }
}

/** Tag do Google: G-XXXX (Analytics) ou AW-XXXX (Google Ads). */
export function lerTagGoogle(
  v: string | null | undefined,
): { ok: true; id: string } | { ok: false; erro: string } {
  const id = (v ?? '').trim().toUpperCase()
  return /^((G|AW)-[A-Z0-9]{4,20})?$/.test(id)
    ? { ok: true, id }
    : { ok: false, erro: 'Tag do Google inválida. Use o formato G-XXXXXXXXXX ou AW-XXXXXXXXXX.' }
}

/** Código que carrega o Pixel da Meta e conta a visita. `id` já passou por lerPixelMeta. */
export const scriptMeta = (id: string) =>
  `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');`

/** Código que configura o gtag. `id` já passou por lerTagGoogle. */
export const scriptGoogle = (id: string) =>
  `window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${id}');`

type ComPixels = Window & {
  fbq?: (...a: unknown[]) => void
  gtag?: (...a: unknown[]) => void
}

/** Avisa os pixels (se a loja tiver) que saiu um pedido. Roda no navegador. */
export function registrarCompra(total: number) {
  const w = window as ComPixels
  w.fbq?.('track', 'Purchase', { value: total, currency: 'BRL' })
  w.gtag?.('event', 'purchase', { value: total, currency: 'BRL' })
}
