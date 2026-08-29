import { NextRequest, NextResponse } from "next/server";
import { requestUrl } from "@/lib/request-url";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(requestUrl(request, "/admin"), 303);
  response.cookies.delete("admin_access");
  return response;
}
