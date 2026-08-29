import { NextRequest, NextResponse } from "next/server";
import { requestUrl } from "@/lib/request-url";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const senha = form.get("senha");
  const correct = process.env.FOLHETO_UPLOAD_PASSWORD;

  if (!correct || senha !== correct) {
    const url = requestUrl(request, "/admin");
    url.search = "?erro=senha";
    return NextResponse.redirect(url, 303);
  }

  const response = NextResponse.redirect(requestUrl(request, "/admin"), 303);
  response.cookies.set("admin_access", correct, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}
