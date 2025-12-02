"use client";

import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { HashScrollHandler } from "@/components/hash-scroll-handler";
import CodeBlock from "@/components/code-block"; // <-- your component (adjust path)

type BlogPostPreviewProps = {
  slug: string;
  title: string;
  description?: string | null;
  bodyMarkdown: string;
  tags: string[];
  thumbnailUrl?: string | null;
  // optional dates, stringified from client
  publishedAt?: string | null;
  createdAt?: string | null;
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

export default function BlogPostPreview(props: BlogPostPreviewProps) {
  const {
    title,
    description,
    bodyMarkdown,
    tags,
    thumbnailUrl,
    publishedAt,
    createdAt,
  } = props;

  const parsedDate =
    coerceDate(publishedAt ?? createdAt ?? null) ?? new Date();
  const formattedDate = parsedDate ? formatDate(parsedDate) : "";

  return (
    <div className="min-h-full bg-background h-full max-h-screen overflow-y-auto overscroll-contain pb-20">
      <HashScrollHandler />
      <div className="space-y-4 border-b border-border relative z-10">
        <div className="absolute top-0 left-0 z-0 w-full h-[400px] [mask-image:linear-gradient(to_top,transparent_25%,black_95%)]">
          <FlickeringGrid
            className="absolute top-0 left-0 size-full"
            squareSize={4}
            gridGap={6}
            color="#e93565"
            maxOpacity={0.5}
            flickerChance={0.1}
          />
        </div>

        <div className="max-w-7xl mx-auto flex flex-col gap-6 p-4 md:p-6">
          <div className="flex flex-wrap items-center gap-3 gap-y-5 text-sm text-muted-foreground">
            {Array.isArray(tags) && tags.length > 0 && (
              <div className="flex flex-wrap gap-3 text-muted-foreground">
                {tags.map((tag) => (
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

            <span className="text-xs uppercase font-semibold text-amber-500 ml-auto">
              Live preview
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tighter text-balance">
            {title || "Untitled post"}
          </h1>

          {description && description.trim() && (
            <p className="text-muted-foreground max-w-4xl md:text-lg md:text-balance">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-0 z-10">
        <main className="w-full p-0 overflow-hidden border-x border-border">
          {thumbnailUrl && (
            <div className="relative w-full h-[280px] md:h-[360px] lg:h-[420px] overflow-hidden object-cover border-b border-border">
              <Image
                src={thumbnailUrl}
                alt={title || "Post thumbnail"}
                fill
                className="object-cover"
                priority={false}
              />
            </div>
          )}

          <div className="p-4 md:p-6 lg:p-8">
            <div className="prose dark:prose-invert max-w-none prose-headings:scroll-mt-8 prose-headings:font-semibold prose-a:no-underline prose-headings:tracking-tight prose-headings:text-balance prose-p:tracking-tight prose-p:text-balance prose-lg">
              {bodyMarkdown?.trim() ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // custom renderer for code
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    code(rawProps: any) {
                      const { inline, className, children, ...props } = rawProps;

                      if (inline) {
                        // inline `code`
                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }

                      // fenced ```code``` blocks → use your CodeBlock wrapper
                      return (
                        <CodeBlock>
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </CodeBlock>
                      );
                    },
                  }}
                >
                  {bodyMarkdown}
                </ReactMarkdown>

              ) : (
                <p className="text-sm text-muted-foreground">
                  Start typing your content to see the markdown preview here.
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
