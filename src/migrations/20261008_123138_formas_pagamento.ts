import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_lojas_formas_pagamento" AS ENUM('pix', 'cartao', 'dinheiro');
  CREATE TABLE "lojas_formas_pagamento" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_lojas_formas_pagamento",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "lojas_formas_pagamento" ADD CONSTRAINT "lojas_formas_pagamento_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."lojas"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "lojas_formas_pagamento_order_idx" ON "lojas_formas_pagamento" USING btree ("order");
  CREATE INDEX "lojas_formas_pagamento_parent_idx" ON "lojas_formas_pagamento" USING btree ("parent_id");`)
  // Lojas que já existem passam a aceitar as três formas (era assim antes, pelo WhatsApp).
  await db.execute(sql`
  INSERT INTO "lojas_formas_pagamento" ("order", "parent_id", "value")
  SELECT f.ordem, l.id, f.valor::"enum_lojas_formas_pagamento"
  FROM "lojas" l CROSS JOIN (VALUES (1, 'pix'), (2, 'cartao'), (3, 'dinheiro')) AS f(ordem, valor);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "lojas_formas_pagamento" CASCADE;
  DROP TYPE "public"."enum_lojas_formas_pagamento";`)
}
