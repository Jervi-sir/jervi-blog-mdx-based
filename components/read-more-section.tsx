/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { prisma } from "@/lib/prisma";

type ReadMoreSectionProps = {
  currentSlug: string;
  currentTags?: string[];
};

function coerceDate(value: unknown): Date | null {
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export async function ReadMoreSection({
  currentSlug,
  currentTags = [],
}: ReadMoreSectionProps) {
  // 1) Get other published posts from Prisma
  const posts = await prisma.blogPost.findMany({
    where: {
      slug: { not: currentSlug },
      published: true,
    },
    orderBy: [
      // fallback sort by publishedAt / createdAt
      { publishedAt: "desc" },
      { createdAt: "desc" },
    ],
    select: {
      slug: true,
      title: true,
      description: true,
      tags: true,
      thumbnailUrl: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  if (!posts || posts.length === 0) {
    return null;
  }

  // 2) Compute relevance score + date for each post
  const scoredPosts = posts
    .map((post) => {
      const tagOverlap = currentTags.filter((tag) =>
        post.tags?.includes(tag),
      ).length;

      const date =
        coerceDate(post.publishedAt) ?? coerceDate(post.createdAt);

      return {
        ...post,
        url: `/blog/${post.slug}`,
        relevanceScore: tagOverlap,
        date,
      };
    })
    .filter((p) => p.date !== null) as Array<
      ReturnType<typeof Object> & { date: Date; relevanceScore: number }
    >;

  if (scoredPosts.length === 0) {
    return null;
  }

  // 3) Sort by tag overlap first, then by date desc
  const otherPosts = scoredPosts
    .sort((a, b) => {
      if (a.relevanceScore !== b.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return b.date.getTime() - a.date.getTime();
    })
    .slice(0, 3);

  if (otherPosts.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-border p-0">
      <div className="p-6 lg:p-10">
        <h2 className="text-2xl font-medium mb-8">Read more</h2>

        <div className="flex flex-col gap-8">
          {otherPosts.map((post) => {
            const formattedDate = formatDate(post.date);

            return (
              <Link
                key={post.slug}
                href={post.url}
                className="group grid grid-cols-1 lg:grid-cols-12 items-center gap-4 cursor-pointer"
              >
                {post.thumbnailUrl && (
                  <div className="flex-shrink-0 col-span-1 lg:col-span-4">
                    <div className="relative w-full h-full">
                      <img
                        src={post.thumbnailUrl}
                        alt={post.title}
                        className="w-full h-full object-cover rounded-lg group-hover:opacity-80 transition-opacity"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2 flex-1 col-span-1 lg:col-span-8">
                  <h3 className="text-lg group-hover:underline underline-offset-4 font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                    {post.description && (
                      <p className="text-muted-foreground text-sm line-clamp-3 group-hover:underline underline-offset-4">
                        {post.description}
                      </p>
                    )}

                  <time className="block text-xs font-medium text-muted-foreground">
                    {formattedDate}
                  </time>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
