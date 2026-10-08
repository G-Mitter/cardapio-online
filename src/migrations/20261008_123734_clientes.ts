import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "clientes_enderecos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rua" varchar NOT NULL,
  	"complemento" varchar,
  	"bairro" varchar NOT NULL
  );
  
  CREATE TABLE "clientes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"telefone" varchar NOT NULL,
  	"nome" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "pedidos" ADD COLUMN "telefone" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "clientes_id" integer;
  ALTER TABLE "clientes_enderecos" ADD CONSTRAINT "clientes_enderecos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."clientes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "clientes_enderecos_order_idx" ON "clientes_enderecos" USING btree ("_order");
  CREATE INDEX "clientes_enderecos_parent_id_idx" ON "clientes_enderecos" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "clientes_telefone_idx" ON "clientes" USING btree ("telefone");
  CREATE INDEX "clientes_updated_at_idx" ON "clientes" USING btree ("updated_at");
  CREATE INDEX "clientes_created_at_idx" ON "clientes" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_clientes_fk" FOREIGN KEY ("clientes_id") REFERENCES "public"."clientes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_clientes_id_idx" ON "payload_locked_documents_rels" USING btree ("clientes_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "clientes_enderecos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "clientes" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "clientes_enderecos" CASCADE;
  DROP TABLE "clientes" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_clientes_fk";
  
  DROP INDEX "payload_locked_documents_rels_clientes_id_idx";
  ALTER TABLE "pedidos" DROP COLUMN "telefone";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "clientes_id";`)
}
