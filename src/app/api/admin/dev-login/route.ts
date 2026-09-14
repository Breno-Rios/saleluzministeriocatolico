import { NextResponse } from "next/server";
import {
  COOKIE_SESSAO,
  OPCOES_COOKIE,
  criarSessao,
  loginDeDesenvolvimento,
} from "@/lib/admin-auth";

/**
 * Atalho para trabalhar no /admin sem configurar Google na máquina de
 * desenvolvimento.
 *
 * loginDeDesenvolvimento() é falso assim que NODE_ENV é "production" ou o
 * Google está configurado, então em produção esta rota responde 404 - o mesmo
 * que um caminho inexistente, sem anunciar que ela existe.
 */
export async function POST() {
  if (!loginDeDesenvolvimento()) {
    return new NextResponse(null, { status: 404 });
  }

  const sessao = criarSessao("dev@local");
  if (!sessao) return new NextResponse(null, { status: 404 });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_SESSAO, sessao.valor, {
    ...OPCOES_COOKIE,
    maxAge: sessao.maxAge,
  });
  return response;
}
