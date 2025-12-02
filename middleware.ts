// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Rahan175";
const SESSION_COOKIE_NAME = "admin_session";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "change-me";

async function createSessionToken(username: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${username}|${ADMIN_PASSWORD}|${SESSION_SECRET}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(hash).toString("hex");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public admin login routes
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/admin/login")
  ) {
    return NextResponse.next();
  }

  // Protect all /admin/**
  if (pathname.startsWith("/admin")) {
    const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!cookie) return redirectToLogin(req);

    const expected = await createSessionToken(ADMIN_USER);

    if (cookie !== expected) return redirectToLogin(req);
  }

  return NextResponse.next();
}

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("redirectTo", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
