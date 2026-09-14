import { cookies } from "next/headers";

/**
 * O /admin é protegido por uma senha única compartilhada com quem publica o
 * folheto - o cookie guarda a própria senha, então basta compará-la de novo.
 * Toda Server Action precisa checar isto por conta própria: elas são
 * alcançáveis por POST direto, sem passar pela página que as renderizou.
 */
export async function isAdmin(): Promise<boolean> {
  const correct = process.env.FOLHETO_UPLOAD_PASSWORD;
  if (!correct) return false;
  const cookieStore = await cookies();
  return cookieStore.get("admin_access")?.value === correct;
}
