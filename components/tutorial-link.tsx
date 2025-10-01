"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type TutorialLinkProps = {
  href: string;
  title: string;
  description?: string;
  className?: string;
};

export function TutorialLink({
  href,
  title,
  description,
  className,
}: TutorialLinkProps) {
  return (
    <div className="flex justify-start">
      <Link
        href={href}
        className={cn(
          "block rounded-xl border p-4 no-underline transition hover:shadow-md",
          className
        )}
      >
        <div className="text-base font-semibold">{title}</div>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </Link>
    </div>
  );
}
