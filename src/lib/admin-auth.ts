import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

/**
 * Sessão do /admin.
 *
 * Quem diz que a pessoa é ela mesma é o Google (ver /api/admin/google); aqui
 * só mora o que vale depois disso: quem tem permissão de publicar e como a
 * sessão sobrevive de uma requisição para a outra.
 *
 * O cookie carrega o e-mail e um vencimento, assinados com um segredo do
 * servidor. A assinatura não é detalhe: sem ela, digitar
 * `admin_session=seu@email.com` no devtools seria o bastante para entrar.
 */

const COOKIE = "admin_session";
const DURACAO_S = 7 * 24 * 60 * 60;

// Só para desenvolvimento: sem isso, toda reinicialização do `next dev`
// derrubaria a sessão. Em produção, sessão nenhuma é emitida sem segredo de
// verdade - ver segredo().
const SEGREDO_DEV = "segredo-de-desenvolvimento-nao-usar-em-producao";

function segredo(): string | null {
  const valor = process.env.ADMIN_SESSION_SECRET;
  if (valor) return valor;
  return process.env.NODE_ENV === "production" ? null : SEGREDO_DEV;
}

export function googleConfigurado(): boolean {
  return !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
}

/**
 * O atalho de desenvolvimento: sem Google configurado, e fora de produção, a
 * tela de login oferece entrar direto. Em produção este caminho não existe -
 * se o Google não estiver configurado lá, o /admin fica fechado, porque um
 * atalho que sobrevive ao deploy deixa de ser conveniência e vira a porta.
 */
export function loginDeDesenvolvimento(): boolean {
  return process.env.NODE_ENV !== "production" && !googleConfigurado();
}

export function emailAutorizado(email: string): boolean {
  const permitidos = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return permitidos.includes(email.trim().toLowerCase());
}

function assinar(payload: string, chave: string): string {
  return createHmac("sha256", chave).update(payload).digest("base64url");
}

export function criarSessao(email: string): { valor: string; maxAge: number } | null {
  const chave = segredo();
  if (!chave) return null;

  const payload = Buffer.from(
    JSON.stringify({ email, exp: Date.now() + DURACAO_S * 1000 }),
  ).toString("base64url");

  return { valor: `${payload}.${assinar(payload, chave)}`, maxAge: DURACAO_S };
}

export const COOKIE_SESSAO = COOKIE;

export const OPCOES_COOKIE = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
} as const;

function emailDaSessao(valor: string | undefined): string | null {
  const chave = segredo();
  if (!valor || !chave) return null;

  const [payload, assinatura] = valor.split(".");
  if (!payload || !assinatura) return null;

  // timingSafeEqual exige buffers do mesmo tamanho, e comparar com === abriria
  // margem para descobrir a assinatura byte a byte pelo tempo de resposta.
  const esperada = Buffer.from(assinar(payload, chave));
  const recebida = Buffer.from(assinatura);
  if (esperada.length !== recebida.length) return null;
  if (!timingSafeEqual(esperada, recebida)) return null;

  try {
    const dados = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof dados.exp !== "number" || dados.exp < Date.now()) return null;
    return typeof dados.email === "string" ? dados.email : null;
  } catch {
    return null;
  }
}

/**
 * A lista de autorizados é reconferida a cada requisição, e não só no login:
 * tirar alguém de ADMIN_EMAILS precisa surtir efeito já, sem esperar o cookie
 * dessa pessoa vencer daqui a uma semana.
 */
function valida(email: string | null): boolean {
  if (!email) return false;
  if (loginDeDesenvolvimento()) return true;
  return emailAutorizado(email);
}

/** Para Server Components e Server Actions. */
export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return valida(emailDaSessao(cookieStore.get(COOKIE)?.value));
}

/** Para Route Handlers, que leem os cookies da própria requisição. */
export function isAdminRequest(request: NextRequest): boolean {
  return valida(emailDaSessao(request.cookies.get(COOKIE)?.value));
}
