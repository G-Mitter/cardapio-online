import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_fechamentos_pagamentos_forma" AS ENUM('pix', 'cartao', 'dinheiro');
  CREATE TABLE "fechamentos_pagamentos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"forma" "enum_fechamentos_pagamentos_forma" NOT NULL,
  	"valor" numeric NOT NULL
  );
  
  CREATE TABLE "fechamentos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"loja_id" integer,
  	"mesa" varchar NOT NULL,
  	"subtotal" numeric NOT NULL,
  	"taxa_servico" numeric DEFAULT 0,
  	"total" numeric NOT NULL,
  	"troco" numeric DEFAULT 0,
  	"garcom_id" integer,
  	"fechado_por_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "fechamentos_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pedidos_id" integer
  );
  
  ALTER TABLE "lojas" ADD COLUMN "taxa_servico" numeric;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "fechamentos_id" integer;
  ALTER TABLE "fechamentos_pagamentos" ADD CONSTRAINT "fechamentos_pagamentos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fechamentos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fechamentos" ADD CONSTRAINT "fechamentos_loja_id_lojas_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."lojas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "fechamentos" ADD CONSTRAINT "fechamentos_garcom_id_users_id_fk" FOREIGN KEY ("garcom_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "fechamentos" ADD CONSTRAINT "fechamentos_fechado_por_id_users_id_fk" FOREIGN KEY ("fechado_por_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "fechamentos_rels" ADD CONSTRAINT "fechamentos_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."fechamentos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fechamentos_rels" ADD CONSTRAINT "fechamentos_rels_pedidos_fk" FOREIGN KEY ("pedidos_id") REFERENCES "public"."pedidos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "fechamentos_pagamentos_order_idx" ON "fechamentos_pagamentos" USING btree ("_order");
  CREATE INDEX "fechamentos_pagamentos_parent_id_idx" ON "fechamentos_pagamentos" USING btree ("_parent_id");
  CREATE INDEX "fechamentos_loja_idx" ON "fechamentos" USING btree ("loja_id");
  CREATE INDEX "fechamentos_garcom_idx" ON "fechamentos" USING btree ("garcom_id");
  CREATE INDEX "fechamentos_fechado_por_idx" ON "fechamentos" USING btree ("fechado_por_id");
  CREATE INDEX "fechamentos_updated_at_idx" ON "fechamentos" USING btree ("updated_at");
  CREATE INDEX "fechamentos_created_at_idx" ON "fechamentos" USING btree ("created_at");
  CREATE INDEX "fechamentos_rels_order_idx" ON "fechamentos_rels" USING btree ("order");
  CREATE INDEX "fechamentos_rels_parent_idx" ON "fechamentos_rels" USING btree ("parent_id");
  CREATE INDEX "fechamentos_rels_path_idx" ON "fechamentos_rels" USING btree ("path");
  CREATE INDEX "fechamentos_rels_pedidos_id_idx" ON "fechamentos_rels" USING btree ("pedidos_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_fechamentos_fk" FOREIGN KEY ("fechamentos_id") REFERENCES "public"."fechamentos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_fechamentos_id_idx" ON "payload_locked_documents_rels" USING btree ("fechamentos_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "fechamentos_pagamentos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "fechamentos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "fechamentos_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "fechamentos_pagamentos" CASCADE;
  DROP TABLE "fechamentos" CASCADE;
  DROP TABLE "fechamentos_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_fechamentos_fk";
  
  DROP INDEX "payload_locked_documents_rels_fechamentos_id_idx";
  ALTER TABLE "lojas" DROP COLUMN "taxa_servico";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "fechamentos_id";
  DROP TYPE "public"."enum_fechamentos_pagamentos_forma";`)
}
