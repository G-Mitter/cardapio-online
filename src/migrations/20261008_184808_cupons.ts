import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_cupons_tipo" AS ENUM('porcentagem', 'valor');
  CREATE TABLE "cupons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"loja_id" integer,
  	"codigo" varchar NOT NULL,
  	"tipo" "enum_cupons_tipo" DEFAULT 'porcentagem' NOT NULL,
  	"valor" numeric NOT NULL,
  	"minimo" numeric,
  	"valido_ate" timestamp(3) with time zone,
  	"limite_uso" numeric,
  	"usos" numeric DEFAULT 0,
  	"ativo" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "pedidos" ADD COLUMN "desconto" numeric DEFAULT 0;
  ALTER TABLE "pedidos" ADD COLUMN "cupom" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "cupons_id" integer;
  ALTER TABLE "cupons" ADD CONSTRAINT "cupons_loja_id_lojas_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."lojas"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "cupons_loja_idx" ON "cupons" USING btree ("loja_id");
  CREATE INDEX "cupons_codigo_idx" ON "cupons" USING btree ("codigo");
  CREATE INDEX "cupons_updated_at_idx" ON "cupons" USING btree ("updated_at");
  CREATE INDEX "cupons_created_at_idx" ON "cupons" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cupons_fk" FOREIGN KEY ("cupons_id") REFERENCES "public"."cupons"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_cupons_id_idx" ON "payload_locked_documents_rels" USING btree ("cupons_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cupons" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "cupons" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_cupons_fk";
  
  DROP INDEX "payload_locked_documents_rels_cupons_id_idx";
  ALTER TABLE "pedidos" DROP COLUMN "desconto";
  ALTER TABLE "pedidos" DROP COLUMN "cupom";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "cupons_id";
  DROP TYPE "public"."enum_cupons_tipo";`)
}
