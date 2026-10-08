import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "lojas_bairros" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nome" varchar,
  	"taxa" numeric
  );
  
  ALTER TABLE "lojas_bairros" ADD CONSTRAINT "lojas_bairros_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lojas"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "lojas_bairros_order_idx" ON "lojas_bairros" USING btree ("_order");
  CREATE INDEX "lojas_bairros_parent_id_idx" ON "lojas_bairros" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "lojas_bairros" CASCADE;`)
}
