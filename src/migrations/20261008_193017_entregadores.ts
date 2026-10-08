import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "entregadores" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"loja_id" integer,
  	"nome" varchar NOT NULL,
  	"whatsapp" varchar NOT NULL,
  	"ativo" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "pedidos" ADD COLUMN "entregador_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "entregadores_id" integer;
  ALTER TABLE "entregadores" ADD CONSTRAINT "entregadores_loja_id_lojas_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."lojas"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "entregadores_loja_idx" ON "entregadores" USING btree ("loja_id");
  CREATE INDEX "entregadores_updated_at_idx" ON "entregadores" USING btree ("updated_at");
  CREATE INDEX "entregadores_created_at_idx" ON "entregadores" USING btree ("created_at");
  ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_entregador_id_entregadores_id_fk" FOREIGN KEY ("entregador_id") REFERENCES "public"."entregadores"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_entregadores_fk" FOREIGN KEY ("entregadores_id") REFERENCES "public"."entregadores"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pedidos_entregador_idx" ON "pedidos" USING btree ("entregador_id");
  CREATE INDEX "payload_locked_documents_rels_entregadores_id_idx" ON "payload_locked_documents_rels" USING btree ("entregadores_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "entregadores" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "entregadores" CASCADE;
  ALTER TABLE "pedidos" DROP CONSTRAINT "pedidos_entregador_id_entregadores_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_entregadores_fk";
  
  DROP INDEX "pedidos_entregador_idx";
  DROP INDEX "payload_locked_documents_rels_entregadores_id_idx";
  ALTER TABLE "pedidos" DROP COLUMN "entregador_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "entregadores_id";`)
}
