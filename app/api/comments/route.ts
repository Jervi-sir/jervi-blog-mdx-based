// app/api/comments/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_CONTENT_LEN = 2000;

// GET /api/comments?slug=slug
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json(
      { error: "Missing slug" },
      { status: 400 }
    );
  }

  const comments = await prisma.blogComment.findMany({
    where: {
      postSlug: slug,
      approved: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const items = comments.map((c) => ({
    id: c.id,
    name: c.name,
    content: c.content,
    createdAt: c.createdAt.toISOString(),
    publicEmail: c.showEmail ? c.email : null,
  }));

  return NextResponse.json({ items });
}

// POST /api/comments?slug=slug
export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json(
      { error: "Missing slug" },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const {
    name,
    email,
    content,
    hideEmail,
  }: {
    name?: string;
    email?: string;
    content?: string;
    hideEmail?: boolean;
  } = body;

  if (!email || !content) {
    return NextResponse.json(
      { error: "email and content are required" },
      { status: 400 }
    );
  }

  if (content.length > MAX_CONTENT_LEN) {
    return NextResponse.json(
      { error: `Content too long (max ${MAX_CONTENT_LEN} chars)` },
      { status: 400 }
    );
  }

  // basic ip / ua capture
  const ip =
    // vercel
    (req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null) ??
    // fallback
    null;
  const userAgent = req.headers.get("user-agent") ?? undefined;

  // you can hash the ip here if you want to store only ipHash, etc.
  const ipHash = ip ? hashIp(ip) : null;

  try {
    const created = await prisma.blogComment.create({
      data: {
        postSlug: slug,
        name: name?.trim() || null,
        email: email.trim(),
        content: content.trim(),
        showEmail: !hideEmail, // note: API uses "hideEmail", DB uses "showEmail"
        ipHash,
        userAgent,
        approved: true, // flip to false if you want moderation
      },
    });

    return NextResponse.json(
      {
        id: created.id,
        ok: true,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/comments error", err);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

// super simple hash (you can replace with crypto module if you want)
function hashIp(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const chr = ip.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return String(hash);
}
