import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "fornecedores" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"loja_id" integer,
  	"nome" varchar NOT NULL,
  	"telefone" varchar,
  	"observacao" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "compras_itens" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"ingrediente_id" integer NOT NULL,
  	"quantidade" numeric NOT NULL,
  	"total" numeric NOT NULL,
  	"custo" numeric NOT NULL
  );
  
  CREATE TABLE "compras" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"loja_id" integer,
  	"fornecedor_id" integer NOT NULL,
  	"data" varchar NOT NULL,
  	"total" numeric NOT NULL,
  	"a_vista" boolean DEFAULT false,
  	"vencimento" varchar,
  	"lancamento_id" integer,
  	"observacao" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "fornecedores_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "compras_id" integer;
  ALTER TABLE "fornecedores" ADD CONSTRAINT "fornecedores_loja_id_lojas_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."lojas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "compras_itens" ADD CONSTRAINT "compras_itens_ingrediente_id_ingredientes_id_fk" FOREIGN KEY ("ingrediente_id") REFERENCES "public"."ingredientes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "compras_itens" ADD CONSTRAINT "compras_itens_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."compras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "compras" ADD CONSTRAINT "compras_loja_id_lojas_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."lojas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "compras" ADD CONSTRAINT "compras_fornecedor_id_fornecedores_id_fk" FOREIGN KEY ("fornecedor_id") REFERENCES "public"."fornecedores"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "compras" ADD CONSTRAINT "compras_lancamento_id_lancamentos_id_fk" FOREIGN KEY ("lancamento_id") REFERENCES "public"."lancamentos"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "fornecedores_loja_idx" ON "fornecedores" USING btree ("loja_id");
  CREATE INDEX "fornecedores_updated_at_idx" ON "fornecedores" USING btree ("updated_at");
  CREATE INDEX "fornecedores_created_at_idx" ON "fornecedores" USING btree ("created_at");
  CREATE INDEX "compras_itens_order_idx" ON "compras_itens" USING btree ("_order");
  CREATE INDEX "compras_itens_parent_id_idx" ON "compras_itens" USING btree ("_parent_id");
  CREATE INDEX "compras_itens_ingrediente_idx" ON "compras_itens" USING btree ("ingrediente_id");
  CREATE INDEX "compras_loja_idx" ON "compras" USING btree ("loja_id");
  CREATE INDEX "compras_fornecedor_idx" ON "compras" USING btree ("fornecedor_id");
  CREATE INDEX "compras_data_idx" ON "compras" USING btree ("data");
  CREATE INDEX "compras_lancamento_idx" ON "compras" USING btree ("lancamento_id");
  CREATE INDEX "compras_updated_at_idx" ON "compras" USING btree ("updated_at");
  CREATE INDEX "compras_created_at_idx" ON "compras" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_fornecedores_fk" FOREIGN KEY ("fornecedores_id") REFERENCES "public"."fornecedores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_compras_fk" FOREIGN KEY ("compras_id") REFERENCES "public"."compras"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_fornecedores_id_idx" ON "payload_locked_documents_rels" USING btree ("fornecedores_id");
  CREATE INDEX "payload_locked_documents_rels_compras_id_idx" ON "payload_locked_documents_rels" USING btree ("compras_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "fornecedores" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "compras_itens" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "compras" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "fornecedores" CASCADE;
  DROP TABLE "compras_itens" CASCADE;
  DROP TABLE "compras" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_fornecedores_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_compras_fk";
  
  DROP INDEX "payload_locked_documents_rels_fornecedores_id_idx";
  DROP INDEX "payload_locked_documents_rels_compras_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "fornecedores_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "compras_id";`)
}
