import type { NextRequest } from "next/server";

// In dev, request.nextUrl.origin always resolves to the hostname the server
// was initialized with ("localhost" by default) regardless of the actual
// Host header, even for origins allowed via allowedDevOrigins - that's
// Next.js's cross-origin dev protection, not a per-request value. Redirecting
// with request.nextUrl.clone() therefore sends LAN clients (phones testing
// over Wi-Fi) to a "localhost" they can't reach. Build the URL from the real
// Host header instead, which does reflect what the client actually requested.
export function requestUrl(request: NextRequest, pathname = "/"): URL {
  const host = request.headers.get("host") ?? request.nextUrl.host;
  const protocol =
    request.headers.get("x-forwarded-proto") ??
    request.nextUrl.protocol.replace(":", "");
  const url = new URL(`${protocol}://${host}`);
  url.pathname = pathname;
  return url;
}
