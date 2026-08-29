import { list } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_FOLHETO_SLUG, isFolhetoSlug, prefixForSlug } from "@/lib/folhetos";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return new NextResponse(null, { status: 404 });
  }

  const tipoParam = request.nextUrl.searchParams.get("tipo");
  const slug = isFolhetoSlug(tipoParam) ? tipoParam : DEFAULT_FOLHETO_SLUG;
  const prefix = prefixForSlug(slug);

  try {
    const { blobs } = await list({ prefix });
    if (blobs.length === 0) {
      return new NextResponse(null, { status: 404 });
    }

    const latest = blobs.reduce((newest, blob) =>
      blob.uploadedAt > newest.uploadedAt ? blob : newest,
    );

    const file = await fetch(latest.url);
    if (!file.ok || !file.body) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(file.body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${prefix}.pdf"`,
        // O conteúdo só muda quando alguém publica pelo painel admin - algo raro
        // e nada urgente ao segundo. Cachear evita rebaixar o mesmo PDF do Blob
        // a cada visita e a cada vez que os dois folhetos pré-carregam juntos.
        "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
