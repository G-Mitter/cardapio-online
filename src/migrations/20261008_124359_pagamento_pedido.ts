import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pedidos_pagamento" AS ENUM('pix', 'cartao', 'dinheiro');
  ALTER TABLE "pedidos" ADD COLUMN "pagamento" "enum_pedidos_pagamento";
  ALTER TABLE "pedidos" ADD COLUMN "troco_para" numeric;
  ALTER TABLE "pedidos" ADD COLUMN "cpf" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pedidos" DROP COLUMN "pagamento";
  ALTER TABLE "pedidos" DROP COLUMN "troco_para";
  ALTER TABLE "pedidos" DROP COLUMN "cpf";
  DROP TYPE "public"."enum_pedidos_pagamento";`)
}
