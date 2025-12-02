// app/api/admin/posts/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/admin/posts/:id
export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { id },
  });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

// PUT /api/admin/posts/:id
export async function PUT(req: Request, { params }: RouteContext) {
  const { id } = await params;
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

  try {
    const post = await prisma.blogPost.update({
      where: { id },
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
  } catch (err: any) {
    console.error("PUT /api/admin/posts/:id error", err);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/posts/:id
export async function DELETE(_req: Request, { params }: RouteContext) {
  const { id } = await params;

  try {
    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("DELETE /api/admin/posts/:id error", err);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
