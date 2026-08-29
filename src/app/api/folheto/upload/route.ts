import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_FOLHETO_SLUG, isFolhetoSlug, prefixForSlug } from "@/lib/folhetos";
import { requestUrl } from "@/lib/request-url";

export async function POST(request: NextRequest) {
  const url = requestUrl(request, "/admin");

  const correct = process.env.FOLHETO_UPLOAD_PASSWORD;
  const authorized =
    correct && request.cookies.get("admin_access")?.value === correct;

  if (!authorized) {
    url.search = "?erro=senha";
    return NextResponse.redirect(url, 303);
  }

  const form = await request.formData();
  const arquivo = form.get("arquivo");
  const tipoValue = form.get("tipo");
  const slug = isFolhetoSlug(tipoValue) ? tipoValue : DEFAULT_FOLHETO_SLUG;

  if (!(arquivo instanceof File) || arquivo.type !== "application/pdf") {
    url.search = `?erro=arquivo&tipo=${slug}`;
    return NextResponse.redirect(url, 303);
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    url.search = `?erro=blob&tipo=${slug}`;
    return NextResponse.redirect(url, 303);
  }

  // O nome do blob é sempre o do tipo selecionado, independente do nome
  // do arquivo enviado - garante que /api/folheto sempre encontre o
  // arquivo certo para cada folheto (missa ou cantos).
  const prefix = prefixForSlug(slug);
  await put(`${prefix}.pdf`, arquivo, {
    access: "public",
    addRandomSuffix: true,
  });

  url.search = `?tipo=${slug}`;
  return NextResponse.redirect(url, 303);
}
