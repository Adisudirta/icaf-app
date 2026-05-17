import { adminAuth } from "./firebase-admin";

export interface ServerSession {
  uid: string;
  email: string | undefined;
  name: string | undefined;
}

async function getSession(
  headers: Headers,
  cookieName: string
): Promise<ServerSession | null> {
  const cookie = headers.get("cookie") ?? "";
  const sessionCookie = parseCookie(cookie, cookieName);
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return { uid: decoded.uid, email: decoded.email, name: decoded.name };
  } catch {
    return null;
  }
}

export function getServerSession(headers: Headers) {
  return getSession(headers, "__session");
}

export function getAdminSession(headers: Headers) {
  return getSession(headers, "__admin_session");
}

function parseCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}
