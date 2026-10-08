# Backup do banco

Todo dia às 3h (horário de Brasília) o GitHub copia o banco inteiro, criptografa e guarda o arquivo por 30 dias, fora do Neon. Quem faz isso é o arquivo `.github/workflows/backup.yml`.

## Ligar (uma vez)

1. Na Vercel, abra o projeto → **Settings → Environment Variables** e copie o valor de `DATABASE_URL_UNPOOLED` (o endereço do banco sem o "pooler", que o `pg_dump` precisa).
2. No GitHub, abra o repositório → **Settings → Secrets and variables → Actions → New repository secret** e crie:
   - `DATABASE_URL` com o valor copiado no passo 1;
   - `BACKUP_SENHA` com uma senha longa, só para os backups. **Guarde essa senha num gerenciador de senhas**: sem ela, o backup não abre.
3. Em **Actions → Backup do banco**, clique em **Run workflow** para testar. Em um ou dois minutos deve aparecer um arquivo `banco-…` no fim da página da execução.

## Restaurar

1. Em **Actions → Backup do banco**, abra a execução do dia que você quer e baixe o arquivo (vem dentro de um `.zip`).
2. No computador, com o `gpg` e o `psql` instalados:

```sh
gpg --decrypt banco-2026-10-08.sql.gz.gpg | gunzip > banco.sql
psql "ENDERECO_DO_BANCO_NOVO" < banco.sql
```

Restaure sempre num banco **novo e vazio** (no Neon: crie um branch ou um projeto novo) e só depois troque o `DATABASE_URL` na Vercel para ele. Assim, se algo der errado, o banco atual continua intacto.
