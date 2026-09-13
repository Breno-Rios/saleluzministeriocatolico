import { del, list, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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

  // O nome do blob é sempre o do tipo selecionado, independente do nome do
  // arquivo enviado. O sufixo aleatório dá uma URL nova a cada publicação, o
  // que faz o folheto novo aparecer na hora mesmo com o cache de um mês que o
  // Blob aplica por padrão.
  const prefix = prefixForSlug(slug);
  const novo = await put(`${prefix}.pdf`, arquivo, {
    access: "public",
    addRandomSuffix: true,
  });

  // Cada publicação cria um blob novo, então as anteriores viram lixo: sem
  // esta faxina elas ficam ocupando o store para sempre. del() não consome
  // operação, e falhar aqui não pode invalidar um upload que já deu certo.
  try {
    const { blobs } = await list({ prefix });
    const antigos = blobs
      .filter((blob) => blob.url !== novo.url)
      .map((blob) => blob.url);
    if (antigos.length > 0) await del(antigos);
  } catch {
    // Sobra de blob antigo é inofensiva: fetchFolhetoUrls pega o mais recente.
  }

  // A landing page ("/") é estática - sem isso, ela continuaria mostrando
  // a disponibilidade do momento do último build/deploy.
  revalidatePath("/");

  url.search = `?tipo=${slug}`;
  return NextResponse.redirect(url, 303);
}
