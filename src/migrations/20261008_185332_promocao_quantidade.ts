import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pedidos" ADD COLUMN "promocao" numeric DEFAULT 0;
  ALTER TABLE "produtos" ADD COLUMN "leve" numeric;
  ALTER TABLE "produtos" ADD COLUMN "pague" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pedidos" DROP COLUMN "promocao";
  ALTER TABLE "produtos" DROP COLUMN "leve";
  ALTER TABLE "produtos" DROP COLUMN "pague";`)
}
