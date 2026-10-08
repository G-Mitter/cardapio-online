import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_users_roles" ADD VALUE 'garcom';
  ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;
  ALTER TABLE "users" ADD COLUMN "loja_do_garcom_id" integer;
  ALTER TABLE "users" ADD COLUMN "nome" varchar;
  ALTER TABLE "users" ADD COLUMN "ativo" boolean DEFAULT true;
  ALTER TABLE "users" ADD COLUMN "username" varchar;
  ALTER TABLE "users" ADD CONSTRAINT "users_loja_do_garcom_id_lojas_id_fk" FOREIGN KEY ("loja_do_garcom_id") REFERENCES "public"."lojas"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_loja_do_garcom_idx" ON "users" USING btree ("loja_do_garcom_id");
  CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" DROP CONSTRAINT "users_loja_do_garcom_id_lojas_id_fk";
  
  ALTER TABLE "users_roles" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_users_roles";
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'loja');
  ALTER TABLE "users_roles" ALTER COLUMN "value" SET DATA TYPE "public"."enum_users_roles" USING "value"::"public"."enum_users_roles";
  DROP INDEX "users_loja_do_garcom_idx";
  DROP INDEX "users_username_idx";
  ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;
  ALTER TABLE "users" DROP COLUMN "loja_do_garcom_id";
  ALTER TABLE "users" DROP COLUMN "nome";
  ALTER TABLE "users" DROP COLUMN "ativo";
  ALTER TABLE "users" DROP COLUMN "username";`)
}
