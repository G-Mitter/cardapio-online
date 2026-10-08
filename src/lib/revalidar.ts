import { revalidatePath } from 'next/cache'

/**
 * Os cardápios ficam em cache (abrem na hora, sem esperar o banco).
 * Quando o dono muda loja, categoria ou produto, o cache é refeito.
 */
// ponytail: refaz o cache de todas as lojas a cada mudança; por slug se um dia houver centenas de lojas.
export function revalidarCardapios() {
  try {
    revalidatePath('/(frontend)/[loja]', 'page')
  } catch {
    // Fora do Next (seed, scripts) não há cache para refazer.
  }
}

export const hooksDeCardapio = {
  afterChange: [
    ({ doc }: { doc: unknown }) => {
      revalidarCardapios()
      return doc
    },
  ],
  afterDelete: [() => revalidarCardapios()],
}
