// app/blog/[slug]/metadata.ts
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  try {
    const { slug } = params;

    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!post || !post.published) {
      return {
        title: "Blog Not Found",
        description: "The requested blog post could not be found.",
      };
    }

    const ogUrl = `${siteConfig.url}/blog/${slug}`;

    return {
      title: post.title,
      description: post.description ?? undefined,
      keywords: [
        post.title,
        ...post.tags,
        "Blog",
        "Article",
      ],
      publisher: "Jervi",
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      openGraph: {
        title: post.title,
        description: post.description ?? undefined,
        url: ogUrl,
        countryName: "Algeria - dz",
        images: [
          {
            url: post.thumbnailUrl || "/images/jervi.png",
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        siteName: siteConfig.name,
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.description ?? undefined,
        creator: "@gacem_humen",
        site: "@jervi",
      },
      alternates: {
        canonical: ogUrl,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Blog Not Found",
      description: "The requested blog post could not be found.",
    };
  }
}
