import { Suspense } from "react";
import { prisma } from "@/lib/prisma";

import { BlogCard } from "@/components/blog-card";
import { TagFilter } from "@/components/tag-filter";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { SocialCards } from "@/components/social-card";
import { AuthorCard } from "@/components/author-card";
import { Card } from "fumadocs-ui/components/card";

type SearchParams = {
  tag?: string;
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const selectedTag = resolvedSearchParams.tag || "All";

  // 🔹 Load posts from DB (only published)
  const posts = await prisma.blogPost.findMany({
    where: {
      published: true,
    },
    orderBy: [
      { publishedAt: "desc" },
      { createdAt: "desc" },
    ],
  });

  // 🔹 Normalize into something close to old BlogPage
  const blogs = posts.map((post) => {
    const date = post.publishedAt ?? post.createdAt;
    return {
      url: `/blog/${post.slug}`,
      title: post.title,
      description: post.description ?? "",
      date,
      tags: post.tags ?? [],
      thumbnail: post.thumbnailUrl ?? undefined,
    };
  });

  // 🔹 Sort again just to be explicit (by date desc)
  const sortedBlogs = blogs.sort((a, b) => {
    const dateA = a.date.getTime();
    const dateB = b.date.getTime();
    return dateB - dateA;
  });

  // 🔹 Build tags list
  const allTags = [
    "All",
    ...Array.from(
      new Set(sortedBlogs.flatMap((blog) => blog.tags || [])),
    ).sort(),
  ];

  // 🔹 Filter by tag
  const filteredBlogs =
    selectedTag === "All"
      ? sortedBlogs
      : sortedBlogs.filter((blog) => blog.tags?.includes(selectedTag));

  // 🔹 Tag counts for TagFilter
  const tagCounts = allTags.reduce((acc, tag) => {
    if (tag === "All") {
      acc[tag] = sortedBlogs.length;
    } else {
      acc[tag] = sortedBlogs.filter((blog) =>
        blog.tags?.includes(tag),
      ).length;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background">
      {/* Background flicker */}
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

      {/* Hero + tag filter */}
      <div className="p-6 border-b border-border flex flex-col gap-6 min-h-[250px] justify-center relative z-10 pl-14">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col gap-2">
            <h1 className="font-medium text-4xl md:text-5xl tracking-tighter">
              Jervi writes
            </h1>
            <p className="text-muted-foreground text-sm md:text-base lg:text-lg">
              Tutorials I talked about.
            </p>
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="max-w-7xl mx-auto w-full">
            <TagFilter
              tags={allTags}
              selectedTag={selectedTag}
              tagCounts={tagCounts}
            />
          </div>
        )}
      </div>

      {/* List + sidebar */}
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-0 flex">
        <Suspense fallback={<div>Loading articles...</div>}>
          <div
            className={[
              "flex flex-col gap-2 relative overflow-hidden",
              "pr-4 py-4",
            ].join(" ")}
          >
            {filteredBlogs.map((blog) => {
              const formattedDate = formatDate(blog.date);

              return (
                <BlogCard
                  key={blog.url}
                  url={blog.url}
                  title={blog.title}
                  description={blog.description}
                  date={formattedDate}
                  thumbnail={blog.thumbnail}
                  showRightBorder={filteredBlogs.length < 3}
                />
              );
            })}

            {filteredBlogs.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">
                No posts found for this tag.
              </p>
            )}
          </div>
        </Suspense>

        <aside className="hidden lg:block w-[350px] flex-shrink-0 p-6 lg:p-10 bg-muted/60 dark:bg-muted/20">
          <div className="sticky top-20 space-y-4">
            <Card title="">
              <AuthorCard />
            </Card>
            <SocialCards />
            {/* <PromoContent variant="desktop" /> */}
          </div>
        </aside>
      </div>
    </div>
  );
}
