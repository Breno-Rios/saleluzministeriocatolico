import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESSAO } from "@/lib/admin-auth";
import { requestUrl } from "@/lib/request-url";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(requestUrl(request, "/admin"), 303);
  response.cookies.delete(COOKIE_SESSAO);
  return response;
}
