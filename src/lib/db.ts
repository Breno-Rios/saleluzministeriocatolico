import { neon } from "@neondatabase/serverless";

/**
 * Cliente Postgres (Neon) sobre HTTP.
 *
 * O driver HTTP não mantém conexão aberta: cada query é um fetch, o que é o
 * que faz sentido num deploy serverless como o da Vercel, onde uma pool de
 * conexões morreria junto com a lambda a cada request.
 *
 * A instância é criada sob demanda, e não no topo do módulo, porque o build
 * importa este arquivo mesmo em ambiente sem DATABASE_URL (preview local de
 * quem só mexe no CSS, por exemplo) - e derrubar o build inteiro por causa
 * disso seria pior do que a página de músicas sair vazia.
 */
let client: ReturnType<typeof neon> | null = null;

export function hasDatabase(): boolean {
  return !!process.env.DATABASE_URL;
}

export function db() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não configurada.");
  }
  client ??= neon(process.env.DATABASE_URL);
  return client;
}
