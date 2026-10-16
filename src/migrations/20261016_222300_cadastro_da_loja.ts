import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "lojas" ADD COLUMN "documento" varchar;
  ALTER TABLE "lojas" ADD COLUMN "aceitou_termos_em" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "lojas" DROP COLUMN "documento";
  ALTER TABLE "lojas" DROP COLUMN "aceitou_termos_em";`)
}
