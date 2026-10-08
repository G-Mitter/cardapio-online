import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_lancamentos_tipo" AS ENUM('pagar', 'receber');
  CREATE TYPE "public"."enum_lancamentos_categoria" AS ENUM('Fornecedores', 'Aluguel', 'Funcionários', 'Impostos', 'Água/luz/gás/internet', 'Taxas de cartão', 'Outros');
  CREATE TABLE "lancamentos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"loja_id" integer,
  	"tipo" "enum_lancamentos_tipo" NOT NULL,
  	"descricao" varchar NOT NULL,
  	"valor" numeric NOT NULL,
  	"vencimento" varchar NOT NULL,
  	"categoria" "enum_lancamentos_categoria",
  	"observacao" varchar,
  	"repetir" boolean DEFAULT false,
  	"dia_do_mes" numeric,
  	"pago_em" varchar,
  	"valor_pago" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "lancamentos_id" integer;
  ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_loja_id_lojas_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."lojas"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "lancamentos_loja_idx" ON "lancamentos" USING btree ("loja_id");
  CREATE INDEX "lancamentos_vencimento_idx" ON "lancamentos" USING btree ("vencimento");
  CREATE INDEX "lancamentos_pago_em_idx" ON "lancamentos" USING btree ("pago_em");
  CREATE INDEX "lancamentos_updated_at_idx" ON "lancamentos" USING btree ("updated_at");
  CREATE INDEX "lancamentos_created_at_idx" ON "lancamentos" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lancamentos_fk" FOREIGN KEY ("lancamentos_id") REFERENCES "public"."lancamentos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_lancamentos_id_idx" ON "payload_locked_documents_rels" USING btree ("lancamentos_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "lancamentos" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "lancamentos" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_lancamentos_fk";
  
  DROP INDEX "payload_locked_documents_rels_lancamentos_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "lancamentos_id";
  DROP TYPE "public"."enum_lancamentos_tipo";
  DROP TYPE "public"."enum_lancamentos_categoria";`)
}
