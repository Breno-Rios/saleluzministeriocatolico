import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/admin";
  url.search = "";

  const response = NextResponse.redirect(url, 303);
  response.cookies.delete("admin_access");
  return response;
}
