import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const senha = form.get("senha");
  const correct = process.env.SITE_PREVIEW_PASSWORD;

  const url = request.nextUrl.clone();

  if (!correct || senha !== correct) {
    url.pathname = "/em-breve";
    url.search = "?erro=1";
    return NextResponse.redirect(url, 303);
  }

  url.pathname = "/";
  url.search = "";
  const response = NextResponse.redirect(url, 303);
  response.cookies.set("preview_access", correct, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
  });
  return response;
}
