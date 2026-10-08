import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "lojas" ADD COLUMN "capa_id" integer;
  ALTER TABLE "lojas" ADD CONSTRAINT "lojas_capa_id_media_id_fk" FOREIGN KEY ("capa_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "lojas_capa_idx" ON "lojas" USING btree ("capa_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "lojas" DROP CONSTRAINT "lojas_capa_id_media_id_fk";
  
  DROP INDEX "lojas_capa_idx";
  ALTER TABLE "lojas" DROP COLUMN "capa_id";`)
}
