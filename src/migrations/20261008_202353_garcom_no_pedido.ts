import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pedidos" ADD COLUMN "garcom_id" integer;
  ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_garcom_id_users_id_fk" FOREIGN KEY ("garcom_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pedidos_garcom_idx" ON "pedidos" USING btree ("garcom_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pedidos" DROP CONSTRAINT "pedidos_garcom_id_users_id_fk";
  
  DROP INDEX "pedidos_garcom_idx";
  ALTER TABLE "pedidos" DROP COLUMN "garcom_id";`)
}
