// Aplica os .sql de db/migrations em ordem, uma única vez cada, registrando o
// que já rodou em schema_migrations. Rode com `npm run db:migrate` - em
// produção, apontando DATABASE_URL para o banco da Vercel.
import { neon } from "@neondatabase/serverless";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "db", "migrations");

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL não definida. Copie a connection string do Neon para .env.local.",
  );
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

/**
 * O driver HTTP do Neon recusa mais de um comando por query, então a migration
 * precisa ser quebrada em statements. Cortar no ";" seco não serve: o caractere
 * também aparece dentro de comentários e de literais de texto. Comentários são
 * descartados aqui - só interessam a quem lê o arquivo.
 *
 * Não cobre dollar quoting ($$...$$); se um dia entrar uma function no schema,
 * este splitter precisa crescer junto.
 */
function dividirStatements(sql) {
  const statements = [];
  let atual = "";
  let i = 0;

  while (i < sql.length) {
    const par = sql.slice(i, i + 2);

    if (par === "--") {
      const fim = sql.indexOf("\n", i);
      i = fim === -1 ? sql.length : fim;
      continue;
    }

    if (par === "/*") {
      const fim = sql.indexOf("*/", i);
      i = fim === -1 ? sql.length : fim + 2;
      continue;
    }

    if (sql[i] === "'") {
      let fim = i + 1;
      while (fim < sql.length) {
        if (sql[fim] === "'" && sql[fim + 1] === "'") fim += 2;
        else if (sql[fim] === "'") break;
        else fim++;
      }
      atual += sql.slice(i, fim + 1);
      i = fim + 1;
      continue;
    }

    if (sql[i] === ";") {
      if (atual.trim()) statements.push(atual.trim());
      atual = "";
      i++;
      continue;
    }

    atual += sql[i];
    i++;
  }

  if (atual.trim()) statements.push(atual.trim());
  return statements;
}

await sql`
  create table if not exists schema_migrations (
    nome text primary key,
    aplicada_em timestamptz not null default now()
  )
`;

const aplicadas = new Set(
  (await sql`select nome from schema_migrations`).map((row) => row.nome),
);

const arquivos = (await readdir(DIR)).filter((f) => f.endsWith(".sql")).sort();
let novas = 0;

for (const arquivo of arquivos) {
  if (aplicadas.has(arquivo)) continue;

  const conteudo = await readFile(path.join(DIR, arquivo), "utf8");
  const statements = dividirStatements(conteudo);

  await sql.transaction((tx) => [
    ...statements.map((s) => tx.query(s)),
    tx`insert into schema_migrations (nome) values (${arquivo})`,
  ]);

  console.log(`aplicada: ${arquivo}`);
  novas++;
}

console.log(novas === 0 ? "Nada a aplicar; banco já está em dia." : `${novas} migration(s) aplicada(s).`);
