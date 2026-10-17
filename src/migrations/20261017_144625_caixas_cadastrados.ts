import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "caixas_cadastrados" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"loja_id" integer,
  	"nome" varchar NOT NULL,
  	"delivery" boolean DEFAULT false,
  	"ativo" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "pedidos" ADD COLUMN "caixa_id" integer;
  ALTER TABLE "fechamentos" ADD COLUMN "caixa_id" integer;
  ALTER TABLE "acertos" ADD COLUMN "caixa_id" integer;
  ALTER TABLE "caixas" ADD COLUMN "cadastro_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "caixas_cadastrados_id" integer;
  ALTER TABLE "caixas_cadastrados" ADD CONSTRAINT "caixas_cadastrados_loja_id_lojas_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."lojas"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "caixas_cadastrados_loja_idx" ON "caixas_cadastrados" USING btree ("loja_id");
  CREATE INDEX "caixas_cadastrados_updated_at_idx" ON "caixas_cadastrados" USING btree ("updated_at");
  CREATE INDEX "caixas_cadastrados_created_at_idx" ON "caixas_cadastrados" USING btree ("created_at");
  ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_caixa_id_caixas_id_fk" FOREIGN KEY ("caixa_id") REFERENCES "public"."caixas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "fechamentos" ADD CONSTRAINT "fechamentos_caixa_id_caixas_id_fk" FOREIGN KEY ("caixa_id") REFERENCES "public"."caixas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acertos" ADD CONSTRAINT "acertos_caixa_id_caixas_id_fk" FOREIGN KEY ("caixa_id") REFERENCES "public"."caixas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "caixas" ADD CONSTRAINT "caixas_cadastro_id_caixas_cadastrados_id_fk" FOREIGN KEY ("cadastro_id") REFERENCES "public"."caixas_cadastrados"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_caixas_cadastrados_fk" FOREIGN KEY ("caixas_cadastrados_id") REFERENCES "public"."caixas_cadastrados"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pedidos_caixa_idx" ON "pedidos" USING btree ("caixa_id");
  CREATE INDEX "fechamentos_caixa_idx" ON "fechamentos" USING btree ("caixa_id");
  CREATE INDEX "acertos_caixa_idx" ON "acertos" USING btree ("caixa_id");
  CREATE INDEX "caixas_cadastro_idx" ON "caixas" USING btree ("cadastro_id");
  CREATE INDEX "payload_locked_documents_rels_caixas_cadastrados_id_idx" ON "payload_locked_documents_rels" USING btree ("caixas_cadastrados_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "caixas_cadastrados" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "caixas_cadastrados" CASCADE;
  ALTER TABLE "pedidos" DROP CONSTRAINT "pedidos_caixa_id_caixas_id_fk";
  
  ALTER TABLE "fechamentos" DROP CONSTRAINT "fechamentos_caixa_id_caixas_id_fk";
  
  ALTER TABLE "acertos" DROP CONSTRAINT "acertos_caixa_id_caixas_id_fk";
  
  ALTER TABLE "caixas" DROP CONSTRAINT "caixas_cadastro_id_caixas_cadastrados_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_caixas_cadastrados_fk";
  
  DROP INDEX "pedidos_caixa_idx";
  DROP INDEX "fechamentos_caixa_idx";
  DROP INDEX "acertos_caixa_idx";
  DROP INDEX "caixas_cadastro_idx";
  DROP INDEX "payload_locked_documents_rels_caixas_cadastrados_id_idx";
  ALTER TABLE "pedidos" DROP COLUMN "caixa_id";
  ALTER TABLE "fechamentos" DROP COLUMN "caixa_id";
  ALTER TABLE "acertos" DROP COLUMN "caixa_id";
  ALTER TABLE "caixas" DROP COLUMN "cadastro_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "caixas_cadastrados_id";`)
}
