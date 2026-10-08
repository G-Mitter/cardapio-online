import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pedidos_itens" ADD COLUMN "produto" numeric;
  ALTER TABLE "pedidos_itens" ADD COLUMN "escolhas" jsonb;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pedidos_itens" DROP COLUMN "produto";
  ALTER TABLE "pedidos_itens" DROP COLUMN "escolhas";`)
}
