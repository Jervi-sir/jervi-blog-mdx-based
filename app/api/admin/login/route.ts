// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Rahan175";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "change-me";
const SESSION_COOKIE_NAME = "admin_session";

async function createSessionToken(username: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${username}|${ADMIN_PASSWORD}|${SESSION_SECRET}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(hash).toString("hex");
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, password } = body;

  if (username !== ADMIN_USER || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createSessionToken(username);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}
