// app/api/admin/posts/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { id: string };
}

// GET /api/admin/posts/:id
export async function GET(_req: Request, { params }: Params) {
  const post = await prisma.blogPost.findUnique({
    where: { id: params.id },
  });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

// PUT /api/admin/posts/:id
export async function PUT(req: Request, { params }: Params) {
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
      where: { id: params.id },
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
export async function DELETE(_req: Request, { params }: Params) {
  try {
    await prisma.blogPost.delete({
      where: { id: params.id },
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
