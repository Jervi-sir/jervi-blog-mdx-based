// app/api/admin/posts/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const body = await req.json();

  const {
    slug,
    title,
    description,
    bodyMarkdown,
    tags,
    thumbnailUrl,
    published,
  } = body;

  if (!slug || !title || !bodyMarkdown) {
    return NextResponse.json(
      { error: "slug, title and bodyMarkdown are required" },
      { status: 400 }
    );
  }

  const post = await prisma.blogPost.create({
    data: {
      slug,
      title,
      description,
      bodyMarkdown,
      tags: Array.isArray(tags) ? tags : [],
      thumbnailUrl,
      published: Boolean(published),
      publishedAt: published ? new Date() : null,
    },
  });

  return NextResponse.json(post);
}
