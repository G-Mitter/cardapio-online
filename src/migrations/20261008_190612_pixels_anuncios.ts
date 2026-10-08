import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "lojas" ADD COLUMN "pixel_meta" varchar;
  ALTER TABLE "lojas" ADD COLUMN "tag_google" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "lojas" DROP COLUMN "pixel_meta";
  ALTER TABLE "lojas" DROP COLUMN "tag_google";`)
}
