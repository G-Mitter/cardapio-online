import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_produtos_selos" AS ENUM('mais-pedido', 'novo', 'promocao', 'vegano', 'picante');
  CREATE TABLE "produtos_selos" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_produtos_selos",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "produtos_selos" ADD CONSTRAINT "produtos_selos_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "produtos_selos_order_idx" ON "produtos_selos" USING btree ("order");
  CREATE INDEX "produtos_selos_parent_idx" ON "produtos_selos" USING btree ("parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "produtos_selos" CASCADE;
  DROP TYPE "public"."enum_produtos_selos";`)
}
