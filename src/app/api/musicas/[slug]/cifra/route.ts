import { NextResponse } from "next/server";
import { db, hasDatabase } from "@/lib/db";

/**
 * O texto da cifra de uma música, buscado quando alguém clica em "Ver cifra".
 *
 * Fica fora da página justamente para não viajar no payload de /musicas: são
 * alguns KB por música, e quase todo visitante entra para ouvir, não para tocar.
 * Uma consulta por clique é barata porque clicar em cifra é raro - e nunca
 * acontece para quem só está passando os olhos.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!hasDatabase()) {
    return NextResponse.json({ erro: "indisponivel" }, { status: 503 });
  }

  const { slug } = await params;

  const linhas = (await db()`
    select cifra from musicas where slug = ${slug} and publicada
  `) as { cifra: string | null }[];

  const cifra = linhas[0]?.cifra;
  if (!cifra) {
    return NextResponse.json({ erro: "sem-cifra" }, { status: 404 });
  }

  return NextResponse.json(
    { cifra },
    // A cifra muda quando alguém edita a música, o que é raro; o cache da borda
    // evita repetir a consulta para cada pessoa que abrir a mesma cifra.
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400" } },
  );
}
