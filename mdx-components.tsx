import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import React from "react";
import {
  MediaViewer,
  ImageViewer,
  VideoViewer,
} from "@/components/media-viewer";
import {
  TutorialLink,
} from "@/components/tutorial-link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AuthorCard } from "@/components/author-card";
import { getAuthor, type AuthorKey } from "@/lib/authors";
import { CopyHeader } from "@/components/copy-header";
import CodeBlock from "./components/code-block";
import { CalloutWithImage } from "./components/callout-with-image";
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';

const createHeading = (level: number) => {
  const Heading = ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => {
    return <CopyHeader level={level} {...props}>{children}</CopyHeader>;
  };

  Heading.displayName = `Heading${level}`;
  return Heading;
};

interface AuthorProps {
  id: AuthorKey;
}

function Author({ id }: AuthorProps) {
  const author = getAuthor(id);
  return <AuthorCard author={author} className="my-8" />;
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    MediaViewer,
    ImageViewer,
    VideoViewer,
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    Author,
    CalloutWithImage,
    h1: createHeading(1),
    h2: createHeading(2),
    h3: createHeading(3),
    h4: createHeading(4),
    h5: createHeading(5),
    h6: createHeading(6),
    pre: (props) => <CodeBlock {...props} />,
    a: ({ href = "", children, ...rest }) => {
      // const isTutorial = typeof href === "string" && href.startsWith("/tutorials/");
      // if (isTutorial) {
      //   return (
      //     <TutorialLink
      //       href={href}
      //       title={String(children)}
      //       description={(rest as any)["data-desc"]}
      //     />
      //   );
      // }
      return <a href={href} target="_blank" className="border-b-1" {...rest}>{children}</a>;
    },
    img: (props) => <ImageZoom {...(props as any)} />,

    ...components,
  };
}

export const useMDXComponents = getMDXComponents;
