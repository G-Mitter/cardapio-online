import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pedidos" ADD COLUMN "agendado_para" timestamp(3) with time zone;
  ALTER TABLE "lojas" ADD COLUMN "aceita_agendamento" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pedidos" DROP COLUMN "agendado_para";
  ALTER TABLE "lojas" DROP COLUMN "aceita_agendamento";`)
}
