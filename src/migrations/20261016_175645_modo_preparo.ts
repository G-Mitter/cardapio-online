import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "produtos" ADD COLUMN "modo_preparo" varchar;
  ALTER TABLE "produtos" ADD COLUMN "na_embalagem" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "produtos" DROP COLUMN "modo_preparo";
  ALTER TABLE "produtos" DROP COLUMN "na_embalagem";`)
}
