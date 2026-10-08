/** O app do Google Maps no celular aceita até 9 paradas no meio do caminho. */
export const MAX_PARADAS = 9

/**
 * Link do Google Maps com a rota pronta: sai da loja, passa pelas paradas na
 * ordem dada e volta para a loja. Abre direto no app do celular do entregador.
 */
export function linkMaps(loja: string, paradas: string[]): string {
  const p = new URLSearchParams({
    api: '1',
    origin: loja,
    destination: loja,
    waypoints: paradas.join('|'),
    travelmode: 'driving',
  })
  return `https://www.google.com/maps/dir/?${p}`
}

/**
 * O endereço do cliente é só rua, complemento e bairro; para o Google achar,
 * juntamos a cidade, tirada do fim do endereço da loja ("Rua X, 10, Belo Horizonte").
 */
// ponytail: cidade = último pedaço do endereço da loja; criar um campo "cidade" se uma loja entregar em outra cidade.
export function comCidade(endereco: string, enderecoLoja: string): string {
  const cidade = enderecoLoja.split(',').at(-1)?.trim()
  return cidade && !endereco.includes(cidade) ? `${endereco}, ${cidade}` : endereco
}
