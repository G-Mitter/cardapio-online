import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pedidos_origem" AS ENUM('site', 'mesa', 'garcom', 'balcao', 'ifood');
  ALTER TABLE "pedidos" ADD COLUMN "origem" "enum_pedidos_origem";
  ALTER TABLE "lojas" ADD COLUMN "aceite_automatico" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pedidos" DROP COLUMN "origem";
  ALTER TABLE "lojas" DROP COLUMN "aceite_automatico";
  DROP TYPE "public"."enum_pedidos_origem";`)
}
