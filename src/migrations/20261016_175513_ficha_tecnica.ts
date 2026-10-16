import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "produtos_ficha" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"ingrediente_id" integer NOT NULL,
  	"quantidade" numeric NOT NULL
  );
  
  ALTER TABLE "produtos" ADD COLUMN "esgotado_auto" boolean DEFAULT false;
  ALTER TABLE "produtos_ficha" ADD CONSTRAINT "produtos_ficha_ingrediente_id_ingredientes_id_fk" FOREIGN KEY ("ingrediente_id") REFERENCES "public"."ingredientes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "produtos_ficha" ADD CONSTRAINT "produtos_ficha_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "produtos_ficha_order_idx" ON "produtos_ficha" USING btree ("_order");
  CREATE INDEX "produtos_ficha_parent_id_idx" ON "produtos_ficha" USING btree ("_parent_id");
  CREATE INDEX "produtos_ficha_ingrediente_idx" ON "produtos_ficha" USING btree ("ingrediente_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "produtos_ficha" CASCADE;
  ALTER TABLE "produtos" DROP COLUMN "esgotado_auto";`)
}
