import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const { blobs } = await list({ prefix: "folheto-do-dia" });
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
        "Content-Disposition": 'inline; filename="folheto-do-dia.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
