import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_lojas_imprimir_origens" AS ENUM('site', 'mesa', 'garcom', 'balcao', 'ifood');
  CREATE TYPE "public"."enum_lojas_largura_ticket" AS ENUM('80', '58');
  CREATE TABLE "lojas_imprimir_origens" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_lojas_imprimir_origens",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "pedidos" ADD COLUMN "impresso" boolean DEFAULT false;
  ALTER TABLE "lojas" ADD COLUMN "impressao_automatica" boolean DEFAULT false;
  ALTER TABLE "lojas" ADD COLUMN "largura_ticket" "enum_lojas_largura_ticket" DEFAULT '80';
  ALTER TABLE "lojas" ADD COLUMN "vias_ticket" numeric DEFAULT 1;
  ALTER TABLE "lojas" ADD COLUMN "impressao_desde" timestamp(3) with time zone;
  ALTER TABLE "lojas_imprimir_origens" ADD CONSTRAINT "lojas_imprimir_origens_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."lojas"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "lojas_imprimir_origens_order_idx" ON "lojas_imprimir_origens" USING btree ("order");
  CREATE INDEX "lojas_imprimir_origens_parent_idx" ON "lojas_imprimir_origens" USING btree ("parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "lojas_imprimir_origens" CASCADE;
  ALTER TABLE "pedidos" DROP COLUMN "impresso";
  ALTER TABLE "lojas" DROP COLUMN "impressao_automatica";
  ALTER TABLE "lojas" DROP COLUMN "largura_ticket";
  ALTER TABLE "lojas" DROP COLUMN "vias_ticket";
  ALTER TABLE "lojas" DROP COLUMN "impressao_desde";
  DROP TYPE "public"."enum_lojas_imprimir_origens";
  DROP TYPE "public"."enum_lojas_largura_ticket";`)
}
