import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_lojas_atendimento_mesas" AS ENUM('ambos', 'garcom', 'cliente');
  ALTER TABLE "pedidos" ADD COLUMN "pediu_conta" boolean DEFAULT false;
  ALTER TABLE "lojas" ADD COLUMN "atendimento_mesas" "enum_lojas_atendimento_mesas" DEFAULT 'ambos';
  ALTER TABLE "lojas" ADD COLUMN "instrucoes_mesa" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pedidos" DROP COLUMN "pediu_conta";
  ALTER TABLE "lojas" DROP COLUMN "atendimento_mesas";
  ALTER TABLE "lojas" DROP COLUMN "instrucoes_mesa";
  DROP TYPE "public"."enum_lojas_atendimento_mesas";`)
}
