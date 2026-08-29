import { NextRequest, NextResponse } from "next/server";

const UNLOCK_COOKIE = "preview_access";
const ALLOWED_PATHS = ["/em-breve", "/api/unlock", "/admin"];

function isLaunched(): boolean {
  const launchAt = process.env.SITE_LAUNCH_AT;
  if (!launchAt) return true;
  return Date.now() >= new Date(launchAt).getTime();
}

export function proxy(request: NextRequest) {
  if (isLaunched()) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (
    ALLOWED_PATHS.includes(pathname) ||
    pathname.startsWith("/api/folheto") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/contato") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname === "/icon.svg" ||
    pathname === "/pdf.worker.min.mjs" ||
    pathname.startsWith("/pdfjs")
  ) {
    return NextResponse.next();
  }

  const cookieValue = process.env.SITE_PREVIEW_PASSWORD;
  if (cookieValue && request.cookies.get(UNLOCK_COOKIE)?.value === cookieValue) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/em-breve";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!favicon.ico).*)"],
};
