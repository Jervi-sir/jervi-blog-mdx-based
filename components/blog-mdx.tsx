// components/blog-mdx.tsx
import * as React from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

import { getMDXComponents } from "@/mdx-components";

type BlogMdxProps = {
  source: string;
};

export function BlogMdx({ source }: BlogMdxProps) {
  const components = getMDXComponents();

  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
        },
      }}
    />
  );
}
