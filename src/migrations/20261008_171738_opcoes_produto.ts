import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "produtos_opcoes_itens" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"preco" numeric DEFAULT 0
  );
  
  CREATE TABLE "produtos_opcoes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"min" numeric DEFAULT 0,
  	"max" numeric DEFAULT 1
  );
  
  ALTER TABLE "pedidos_itens" ADD COLUMN "opcoes" varchar;
  ALTER TABLE "produtos_opcoes_itens" ADD CONSTRAINT "produtos_opcoes_itens_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."produtos_opcoes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "produtos_opcoes" ADD CONSTRAINT "produtos_opcoes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."produtos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "produtos_opcoes_itens_order_idx" ON "produtos_opcoes_itens" USING btree ("_order");
  CREATE INDEX "produtos_opcoes_itens_parent_id_idx" ON "produtos_opcoes_itens" USING btree ("_parent_id");
  CREATE INDEX "produtos_opcoes_order_idx" ON "produtos_opcoes" USING btree ("_order");
  CREATE INDEX "produtos_opcoes_parent_id_idx" ON "produtos_opcoes" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "produtos_opcoes_itens" CASCADE;
  DROP TABLE "produtos_opcoes" CASCADE;
  ALTER TABLE "pedidos_itens" DROP COLUMN "opcoes";`)
}
