import { NextResponse, type NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

function parseCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

async function isAuthenticated(
  request: NextRequest,
  cookieName: string
): Promise<boolean> {
  const cookie = request.headers.get("cookie") ?? "";
  const sessionCookie = parseCookie(cookie, cookieName);
  if (!sessionCookie) return false;
  try {
    await adminAuth.verifySessionCookie(sessionCookie, true);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPath =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  // X-Admin-Header guard applies only to /admin page routes, not API routes.
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const secret = process.env.ADMIN_HEADER_SECRET;
    const adminHeader = request.headers.get("x-admin");
    if (!secret || adminHeader !== secret) {
      return NextResponse.rewrite(new URL("/_not-found", request.url));
    }
  }

  // Skip session check for the login page and the admin session endpoint.
  const isAdminSessionEndpoint = pathname === "/api/admin/auth/session";
  const isAdminLoginPage = pathname === "/admin/login";
  if (!isAdminLoginPage && !isAdminSessionEndpoint) {
    const cookieName = isAdminPath ? "__admin_session" : "__session";
    const authed = await isAuthenticated(request, cookieName);

    if (!authed) {
      if (pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/analysis/:path*",
    "/create/:path*",
    "/review/:path*",
    "/admin/:path*",
    "/admin",
    "/api/admin/:path*",
  ],
};
