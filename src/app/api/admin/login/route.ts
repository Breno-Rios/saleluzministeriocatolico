import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const senha = form.get("senha");
  const correct = process.env.FOLHETO_UPLOAD_PASSWORD;

  const url = request.nextUrl.clone();
  url.pathname = "/admin";

  if (!correct || senha !== correct) {
    url.search = "?erro=senha";
    return NextResponse.redirect(url, 303);
  }

  url.search = "";
  const response = NextResponse.redirect(url, 303);
  response.cookies.set("admin_access", correct, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}
