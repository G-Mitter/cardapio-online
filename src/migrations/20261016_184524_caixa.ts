import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_caixas_movimentos_tipo" AS ENUM('sangria', 'suprimento');
  CREATE TABLE "caixas_movimentos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tipo" "enum_caixas_movimentos_tipo" NOT NULL,
  	"valor" numeric NOT NULL,
  	"motivo" varchar NOT NULL,
  	"em" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "caixas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"loja_id" integer,
  	"aberto_em" timestamp(3) with time zone NOT NULL,
  	"troco_inicial" numeric NOT NULL,
  	"fechado_em" timestamp(3) with time zone,
  	"esperado" numeric,
  	"contado" numeric,
  	"diferenca" numeric,
  	"observacao" varchar,
  	"aberto_por_id" integer,
  	"fechado_por_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "caixas_id" integer;
  ALTER TABLE "caixas_movimentos" ADD CONSTRAINT "caixas_movimentos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."caixas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "caixas" ADD CONSTRAINT "caixas_loja_id_lojas_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."lojas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "caixas" ADD CONSTRAINT "caixas_aberto_por_id_users_id_fk" FOREIGN KEY ("aberto_por_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "caixas" ADD CONSTRAINT "caixas_fechado_por_id_users_id_fk" FOREIGN KEY ("fechado_por_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "caixas_movimentos_order_idx" ON "caixas_movimentos" USING btree ("_order");
  CREATE INDEX "caixas_movimentos_parent_id_idx" ON "caixas_movimentos" USING btree ("_parent_id");
  CREATE INDEX "caixas_loja_idx" ON "caixas" USING btree ("loja_id");
  CREATE INDEX "caixas_aberto_em_idx" ON "caixas" USING btree ("aberto_em");
  CREATE INDEX "caixas_fechado_em_idx" ON "caixas" USING btree ("fechado_em");
  CREATE INDEX "caixas_aberto_por_idx" ON "caixas" USING btree ("aberto_por_id");
  CREATE INDEX "caixas_fechado_por_idx" ON "caixas" USING btree ("fechado_por_id");
  CREATE INDEX "caixas_updated_at_idx" ON "caixas" USING btree ("updated_at");
  CREATE INDEX "caixas_created_at_idx" ON "caixas" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_caixas_fk" FOREIGN KEY ("caixas_id") REFERENCES "public"."caixas"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_caixas_id_idx" ON "payload_locked_documents_rels" USING btree ("caixas_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "caixas_movimentos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "caixas" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "caixas_movimentos" CASCADE;
  DROP TABLE "caixas" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_caixas_fk";
  
  DROP INDEX "payload_locked_documents_rels_caixas_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "caixas_id";
  DROP TYPE "public"."enum_caixas_movimentos_tipo";`)
}
