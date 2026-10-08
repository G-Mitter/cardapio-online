import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pedidos" ADD COLUMN "mesa" varchar;
  ALTER TABLE "pedidos" ADD COLUMN "conta_fechada" boolean DEFAULT false;
  ALTER TABLE "lojas" ADD COLUMN "mesas" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pedidos" DROP COLUMN "mesa";
  ALTER TABLE "pedidos" DROP COLUMN "conta_fechada";
  ALTER TABLE "lojas" DROP COLUMN "mesas";`)
}
