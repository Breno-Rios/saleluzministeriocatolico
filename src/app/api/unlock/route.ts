import { NextRequest, NextResponse } from "next/server";
import { requestUrl } from "@/lib/request-url";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const senha = form.get("senha");
  const correct = process.env.SITE_PREVIEW_PASSWORD;

  if (!correct || senha !== correct) {
    const url = requestUrl(request, "/em-breve");
    url.search = "?erro=1";
    return NextResponse.redirect(url, 303);
  }

  const response = NextResponse.redirect(requestUrl(request, "/"), 303);
  response.cookies.set("preview_access", correct, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}
