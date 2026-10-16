/** Login do garçom: "usuario.slug-da-loja". Não repete o final se já veio completo. */
export function loginDoGarcom(usuario: string, slug: string) {
  const u = usuario.trim().toLowerCase()
  return u.endsWith(`.${slug}`) ? u : `${u}.${slug}`
}
