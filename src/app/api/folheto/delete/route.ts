import { del, list } from "@vercel/blob";
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
  const tipoValue = form.get("tipo");
  const slug = isFolhetoSlug(tipoValue) ? tipoValue : DEFAULT_FOLHETO_SLUG;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    url.search = `?erro=blob&tipo=${slug}`;
    return NextResponse.redirect(url, 303);
  }

  const prefix = prefixForSlug(slug);
  const { blobs } = await list({ prefix });
  if (blobs.length > 0) {
    await del(blobs.map((blob) => blob.url));
  }

  // A landing page ("/") é estática - sem isso, ela continuaria mostrando
  // a disponibilidade do momento do último build/deploy.
  revalidatePath("/");

  url.search = `?tipo=${slug}`;
  return NextResponse.redirect(url, 303);
}
