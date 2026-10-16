import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "contatos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"loja_id" integer,
  	"telefone" varchar NOT NULL,
  	"aceita_promocoes" boolean DEFAULT false,
  	"aceitou_em" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "contatos_id" integer;
  ALTER TABLE "contatos" ADD CONSTRAINT "contatos_loja_id_lojas_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."lojas"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "contatos_loja_idx" ON "contatos" USING btree ("loja_id");
  CREATE INDEX "contatos_telefone_idx" ON "contatos" USING btree ("telefone");
  CREATE INDEX "contatos_updated_at_idx" ON "contatos" USING btree ("updated_at");
  CREATE INDEX "contatos_created_at_idx" ON "contatos" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contatos_fk" FOREIGN KEY ("contatos_id") REFERENCES "public"."contatos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_contatos_id_idx" ON "payload_locked_documents_rels" USING btree ("contatos_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contatos" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "contatos" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_contatos_fk";
  
  DROP INDEX "payload_locked_documents_rels_contatos_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "contatos_id";`)
}
