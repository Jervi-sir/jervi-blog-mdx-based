// app/api/blog/[slug]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  if (!slug) {
    return NextResponse.json(
      { error: "Missing slug" },
      { status: 400 },
    );
  }

  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post || !post.published) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    id: post.id,
    slug: post.slug,
    title: post.title,
    description: post.description,
    bodyMarkdown: post.bodyMarkdown,
    tags: post.tags,
    thumbnailUrl: post.thumbnailUrl,
    published: post.published,
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    views: post.views,
  });
}
