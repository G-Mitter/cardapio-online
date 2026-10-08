import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "acertos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"loja_id" integer,
  	"entregador_id" integer NOT NULL,
  	"dia" varchar NOT NULL,
  	"dinheiro" numeric NOT NULL,
  	"cartao" numeric DEFAULT 0,
  	"pix" numeric DEFAULT 0,
  	"troco" numeric DEFAULT 0,
  	"taxas" numeric DEFAULT 0,
  	"descontou_taxa" boolean DEFAULT false,
  	"esperado" numeric NOT NULL,
  	"entregue" numeric NOT NULL,
  	"diferenca" numeric NOT NULL,
  	"conferido_por_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acertos_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pedidos_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "acertos_id" integer;
  ALTER TABLE "acertos" ADD CONSTRAINT "acertos_loja_id_lojas_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."lojas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acertos" ADD CONSTRAINT "acertos_entregador_id_entregadores_id_fk" FOREIGN KEY ("entregador_id") REFERENCES "public"."entregadores"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acertos" ADD CONSTRAINT "acertos_conferido_por_id_users_id_fk" FOREIGN KEY ("conferido_por_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acertos_rels" ADD CONSTRAINT "acertos_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."acertos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "acertos_rels" ADD CONSTRAINT "acertos_rels_pedidos_fk" FOREIGN KEY ("pedidos_id") REFERENCES "public"."pedidos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "acertos_loja_idx" ON "acertos" USING btree ("loja_id");
  CREATE INDEX "acertos_entregador_idx" ON "acertos" USING btree ("entregador_id");
  CREATE INDEX "acertos_conferido_por_idx" ON "acertos" USING btree ("conferido_por_id");
  CREATE INDEX "acertos_updated_at_idx" ON "acertos" USING btree ("updated_at");
  CREATE INDEX "acertos_created_at_idx" ON "acertos" USING btree ("created_at");
  CREATE INDEX "acertos_rels_order_idx" ON "acertos_rels" USING btree ("order");
  CREATE INDEX "acertos_rels_parent_idx" ON "acertos_rels" USING btree ("parent_id");
  CREATE INDEX "acertos_rels_path_idx" ON "acertos_rels" USING btree ("path");
  CREATE INDEX "acertos_rels_pedidos_id_idx" ON "acertos_rels" USING btree ("pedidos_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_acertos_fk" FOREIGN KEY ("acertos_id") REFERENCES "public"."acertos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_acertos_id_idx" ON "payload_locked_documents_rels" USING btree ("acertos_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "acertos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "acertos_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "acertos" CASCADE;
  DROP TABLE "acertos_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_acertos_fk";
  
  DROP INDEX "payload_locked_documents_rels_acertos_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "acertos_id";`)
}
