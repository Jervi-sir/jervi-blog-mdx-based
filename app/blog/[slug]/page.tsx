// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DocsBody } from "fumadocs-ui/page";
import { MDXRemote } from "next-mdx-remote/rsc";

import { Button } from "@/components/ui/button";
import { TableOfContents } from "@/components/table-of-contents";
import { MobileTableOfContents } from "@/components/mobile-toc";
import { ReadMoreSection } from "@/components/read-more-section";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { HashScrollHandler } from "@/components/hash-scroll-handler";
import { ViewCounter } from "@/components/view-counter";
import { useMDXComponents } from "@/mdx-components";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ preview?: string }>;
};

function coerceDate(value: unknown): Date | null {
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function getPost(slug: string, preview = false) {
  if (!slug) return null;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post) return null;

  // Only published for normal visitors; allow draft for preview
  if (!post.published && !preview) return null;

  return post;
}

export default async function BlogPost({ params, searchParams }: PageProps) {
  // ✅ await the dynamic APIs
  const { slug } = await params;
  const resolvedSearchParams = searchParams
    ? await searchParams
    : undefined;

  const previewMode = resolvedSearchParams?.preview === "1";

  const post = await getPost(slug, previewMode);

  if (!post) {
    notFound();
  }

  const parsedDate = coerceDate(post.publishedAt ?? post.createdAt);
  const formattedDate = parsedDate ? formatDate(parsedDate) : "";

  const components = useMDXComponents();

  return (
    <div className="min-h-screen bg-background">
      <HashScrollHandler />
      <div className="absolute top-0 left-0 z-0 w-full h-[600px] [mask-image:linear-gradient(to_top,transparent_25%,black_95%)]">
        <FlickeringGrid
          className="absolute top-0 left-0 size-full"
          squareSize={4}
          gridGap={6}
          color="#e93565"
          maxOpacity={0.5}
          flickerChance={0.1}
        />
      </div>

      <div className="space-y-4 border-b border-border relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-6 p-6">
          <div className="flex flex-wrap items-center gap-3 gap-y-5 text-sm text-muted-foreground">
            <Button variant="outline" asChild className="h-6 w-6">
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
                <span className="sr-only">Back to all articles</span>
              </Link>
            </Button>

            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-3 text-muted-foreground">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="h-6 w-fit px-3 text-sm font-medium bg-muted text-muted-foreground rounded-md border flex items-center justify-center"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {formattedDate && (
              <time className="font-medium text-muted-foreground">
                {formattedDate}
              </time>
            )}

            {previewMode && (
              <span className="text-xs uppercase font-semibold text-amber-500 ml-auto">
                Preview mode
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tighter text-balance">
            {post.title}
          </h1>

          {post.description && (
            <p className="text-muted-foreground max-w-4xl md:text-lg md:text-balance">
              {post.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex divide-x divide-border relative max-w-7xl mx-auto px-4 md:px-0 z-10">
        <div className="absolute max-w-7xl mx-auto left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] lg:w-full h-full border-x border-border p-0 pointer-events-none" />
        <main className="w-full p-0 overflow-hidden">
          {post.thumbnailUrl && (
            <div className="relative w-full h-[500px] overflow-hidden object-cover border border-transparent">
              <Image
                src={post.thumbnailUrl}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="p-6 lg:p-10">
            <div className="prose dark:prose-invert max-w-none prose-headings:scroll-mt-8 prose-headings:font-semibold prose-a:no-underline prose-headings:tracking-tight prose-headings:text-balance prose-p:tracking-tight prose-p:text-balance prose-lg">
              <DocsBody>
                <MDXRemote
                  source={post.bodyMarkdown}
                  components={components}
                />
              </DocsBody>
            </div>
          </div>

          <div className="p-6 lg:p-10 pt-0 border-t-1">
            {/* comments, etc */}
          </div>

          <div className="mt-10">
            <ReadMoreSection
              currentSlug={[post.slug]}
              currentTags={post.tags}
            />
          </div>
        </main>

        <aside className="hidden lg:block w-[350px] flex-shrink-0 p-6 lg:p-10 bg-muted/60 dark:bg-muted/20">
          <div className="sticky top-20 space-y-8">
            <div className="border border-border rounded-lg p-6 bg-card">
              <TableOfContents />
            </div>

            <ViewCounter
              slug={post.slug}
              className="font-medium text-muted-foreground"
            />
          </div>
        </aside>
      </div>

      <MobileTableOfContents />
    </div>
  );
}
