import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_ingredientes_unidade" AS ENUM('un', 'g', 'kg', 'ml', 'l');
  CREATE TABLE "ingredientes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"loja_id" integer,
  	"nome" varchar NOT NULL,
  	"unidade" "enum_ingredientes_unidade" DEFAULT 'un' NOT NULL,
  	"quantidade" numeric DEFAULT 0 NOT NULL,
  	"minimo" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "ingredientes_id" integer;
  ALTER TABLE "ingredientes" ADD CONSTRAINT "ingredientes_loja_id_lojas_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."lojas"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "ingredientes_loja_idx" ON "ingredientes" USING btree ("loja_id");
  CREATE INDEX "ingredientes_updated_at_idx" ON "ingredientes" USING btree ("updated_at");
  CREATE INDEX "ingredientes_created_at_idx" ON "ingredientes" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ingredientes_fk" FOREIGN KEY ("ingredientes_id") REFERENCES "public"."ingredientes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_ingredientes_id_idx" ON "payload_locked_documents_rels" USING btree ("ingredientes_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ingredientes" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "ingredientes" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_ingredientes_fk";
  
  DROP INDEX "payload_locked_documents_rels_ingredientes_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "ingredientes_id";
  DROP TYPE "public"."enum_ingredientes_unidade";`)
}
