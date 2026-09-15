import { neon, neonConfig } from "@neondatabase/serverless";

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
  client ??= neon(usarProxyLocal(process.env.DATABASE_URL));
  return client;
}

/**
 * Em produção o driver fala com o endpoint HTTP do próprio Neon. Apontando
 * DATABASE_URL para um Postgres local (docker compose), quem responde é o
 * proxy que sobe junto - ver docker-compose.yml.
 *
 * Os scripts de migration e seed repetem esta regra: rodam fora do bundle do
 * Next e não conseguem importar este módulo.
 */
function usarProxyLocal(connectionString: string): string {
  const { hostname } = new URL(connectionString);
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    neonConfig.fetchEndpoint = `http://${hostname}:4444/sql`;
  }
  return connectionString;
}
