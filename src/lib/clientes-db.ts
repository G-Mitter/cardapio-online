import type { Payload } from 'payload'

/** Cadastro do cliente pelo telefone já normalizado (src/lib/cliente.ts). Só para o servidor. */
export async function buscarCliente(payload: Payload, telefone: string) {
  const { docs } = await payload.find({
    collection: 'clientes',
    where: { telefone: { equals: telefone } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return docs[0] ?? null
}
