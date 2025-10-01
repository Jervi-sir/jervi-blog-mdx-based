// app/api/views/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const VIEW_WINDOW_MIN = Number(process.env.VIEW_WINDOW_MIN ?? 360); // 6h

function getIP(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  // @ts-ignore - Next’s Node Request may not expose .ip
  return (req as any)?.ip ?? null;
}

function hashIP(ip: string | null | undefined) {
  const base = ip ?? "unknown";
  const salt = process.env.COMMENT_SALT ?? ""; // reuse existing salt
  return crypto.createHash("sha256").update(base + "|" + salt).digest("hex");
}

function parseSlugs(searchParams: URLSearchParams): string[] {
  const slug = searchParams.get("slug");
  const slugs = searchParams.get("slugs");
  if (slugs) return slugs.split(",").map((s) => s.trim()).filter(Boolean);
  if (slug) return [slug];
  return [];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slugs = parseSlugs(searchParams);
  if (slugs.length === 0) return NextResponse.json({ error: "Missing slug(s)" }, { status: 400 });

  const stats = await prisma.blogStat.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, views: true },
  });

  const map: Record<string, number> = {};
  for (const s of slugs) map[s] = 0;
  for (const row of stats) map[row.slug] = row.views;

  return NextResponse.json({ views: map });
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") ?? "";
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const ip = getIP(req);
  const ipHash = hashIP(ip);
  const ua = req.headers.get("user-agent") ?? undefined;

  // De-dupe window
  const since = new Date(Date.now() - VIEW_WINDOW_MIN * 60 * 1000);

  // if we’ve seen this ipHash for this slug recently, don’t increment
  const recent = await prisma.blogView.findFirst({
    where: { slug, ipHash, createdAt: { gte: since } },
    select: { id: true },
  });

  let incremented = false;

  if (!recent) {
    await prisma.$transaction([
      prisma.blogView.create({ 
        data: { 
          slug, 
          ip,
          ipHash, 
          userAgent: ua 
        } }),
      prisma.blogStat.upsert({
        where: { slug },
        create: { slug, views: 1 },
        update: { views: { increment: 1 } },
      }),
    ]);
    incremented = true;
  }

  // Return the current count
  const stat = await prisma.blogStat.findUnique({ where: { slug } });
  return NextResponse.json({ ok: true, incremented, views: stat?.views ?? 0 });
}
