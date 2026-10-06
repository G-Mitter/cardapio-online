import { DefaultDashboard, type DashboardViewServerProps } from '@payloadcms/next/views'
import { redirect } from 'next/navigation'

import { ehAdmin } from '@/access/roles'

/** Tela inicial do /admin: o dono da loja cai direto nos pedidos de hoje; você vê o painel completo. */
export function Inicio(props: DashboardViewServerProps) {
  if (!ehAdmin(props.user)) redirect('/admin/pedidos-de-hoje')
  return <DefaultDashboard {...props} />
}
