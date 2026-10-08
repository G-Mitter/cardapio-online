import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "carrinhos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"loja_id" integer,
  	"telefone" varchar NOT NULL,
  	"nome" varchar NOT NULL,
  	"resumo" varchar NOT NULL,
  	"total" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "carrinhos_id" integer;
  ALTER TABLE "carrinhos" ADD CONSTRAINT "carrinhos_loja_id_lojas_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."lojas"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "carrinhos_loja_idx" ON "carrinhos" USING btree ("loja_id");
  CREATE INDEX "carrinhos_telefone_idx" ON "carrinhos" USING btree ("telefone");
  CREATE INDEX "carrinhos_updated_at_idx" ON "carrinhos" USING btree ("updated_at");
  CREATE INDEX "carrinhos_created_at_idx" ON "carrinhos" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_carrinhos_fk" FOREIGN KEY ("carrinhos_id") REFERENCES "public"."carrinhos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_carrinhos_id_idx" ON "payload_locked_documents_rels" USING btree ("carrinhos_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "carrinhos" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "carrinhos" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_carrinhos_fk";
  
  DROP INDEX "payload_locked_documents_rels_carrinhos_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "carrinhos_id";`)
}
