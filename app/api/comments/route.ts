// app/api/comments/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const MAX_LEN = { name: 80, email: 160, content: 2_000 };

function sanitize(s: unknown, max: number) {
  if (typeof s !== "string") return "";
  const t = s.trim();
  return t.slice(0, max);
}

function isEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function hashIP(ip: string | null | undefined) {
  const base = ip ?? "unknown";
  const salt = process.env.COMMENT_SALT ?? "";
  return crypto.createHash("sha256").update(base + salt).digest("hex");
}

function hashEmail(email: string) {
  const salt = process.env.COMMENT_SALT ?? "";
  return crypto.createHash("sha256").update(email.toLowerCase() + "|" + salt).digest("hex");
}

function maskEmail(email: string) {
  // simple mask: keep first char of local & domain labels
  try {
    const [local, domain] = email.split("@");
    if (!local || !domain) return "";
    const [domLabel, ...rest] = domain.split(".");
    const tLocal = local.length > 1 ? local[0] + "*".repeat(Math.min(3, local.length - 1)) : local;
    const tDom =
      domLabel.length > 1 ? domLabel[0] + "*".repeat(Math.min(4, domLabel.length - 1)) : domLabel;
    const tTld = rest.length ? "." + rest[rest.length - 1] : "";
    return `${tLocal}@${tDom}${tTld}`;
  } catch {
    return "";
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") ?? "";
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const rows = await prisma.blogComment.findMany({
    where: { slug, approved: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, content: true, createdAt: true, email: true, showEmail: true },
  });

  // Don’t leak raw email—return masked only if showEmail is true
  const items = rows.map((r) => ({
    id: r.id,
    name: r.name,
    content: r.content,
    createdAt: r.createdAt,
    publicEmail: r.showEmail ? maskEmail(r.email) : null,
  }));

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") ?? "";
    if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

    const body = await req.json().catch(() => ({} as any));
    const name = sanitize(body.name, MAX_LEN.name) || null;
    const email = sanitize(body.email, MAX_LEN.email);
    const content = sanitize(body.content, MAX_LEN.content);
    const hideEmail = !!body.hideEmail; // from client
    const showEmail = !hideEmail;

    if (!email || !isEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 422 });
    }
    if (!content || content.length < 3) {
      return NextResponse.json({ error: "Comment is too short" }, { status: 422 });
    }

    // Rate limit (email + IP)
    const ip =
      (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
      (req as any)?.ip ||
      null;
    const ipHash = hashIP(ip);
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const emailHash = hashEmail(email);

    const recentCount = await prisma.blogComment.count({
      where: { email, ipHash, createdAt: { gte: since } },
    });
    if (recentCount >= 5) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const ua = req.headers.get("user-agent") ?? undefined;

    const saved = await prisma.blogComment.create({
      data: {
        slug,
        name,
        email,
        showEmail,   // ← persist the consent
        emailHash,   // ← optional analytics/dedupe
        content,
        ipHash,
        userAgent: ua,
      },
      select: { id: true, name: true, content: true, createdAt: true, email: true, showEmail: true },
    });

    // Return masked email (or null), never raw
    return NextResponse.json({
      ok: true,
      item: {
        id: saved.id,
        name: saved.name,
        content: saved.content,
        createdAt: saved.createdAt,
        publicEmail: saved.showEmail ? maskEmail(saved.email) : null,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
