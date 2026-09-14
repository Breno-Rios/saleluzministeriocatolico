import { OAuth2Client } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";
import {
  COOKIE_SESSAO,
  OPCOES_COOKIE,
  criarSessao,
  emailAutorizado,
  googleConfigurado,
} from "@/lib/admin-auth";

/**
 * Troca o ID token que o botão do Google devolveu no navegador por uma sessão
 * do /admin.
 *
 * A verificação aqui é o que faz o login existir: o token chega pelo corpo de
 * um POST, e qualquer um pode escrever um POST. verifyIdToken() confere a
 * assinatura contra as chaves públicas do Google, que o token foi emitido para
 * este client ID (senão um token válido de outro site entraria aqui) e que não
 * venceu.
 */
export async function POST(request: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!googleConfigurado() || !clientId) {
    return NextResponse.json({ erro: "login-indisponivel" }, { status: 503 });
  }

  const { credential } = await request.json().catch(() => ({ credential: null }));
  if (typeof credential !== "string") {
    return NextResponse.json({ erro: "token-ausente" }, { status: 400 });
  }

  let email: string | undefined;
  try {
    const ticket = await new OAuth2Client(clientId).verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    // Um e-mail não verificado não prova nada sobre quem é a pessoa.
    if (payload?.email_verified) email = payload.email;
  } catch {
    // Assinatura inválida, token vencido ou de outro client: cai no 401.
  }

  if (!email) {
    return NextResponse.json({ erro: "token-invalido" }, { status: 401 });
  }

  // Autenticado no Google, mas isso não basta: o site tem uma lista de quem
  // pode publicar.
  if (!emailAutorizado(email)) {
    return NextResponse.json({ erro: "sem-permissao", email }, { status: 403 });
  }

  const sessao = criarSessao(email);
  if (!sessao) {
    // Produção sem ADMIN_SESSION_SECRET: sem segredo não há como assinar, e
    // emitir cookie sem assinatura seria pior do que não deixar entrar.
    return NextResponse.json({ erro: "sessao-indisponivel" }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true, email });
  response.cookies.set(COOKIE_SESSAO, sessao.valor, {
    ...OPCOES_COOKIE,
    maxAge: sessao.maxAge,
  });
  return response;
}
