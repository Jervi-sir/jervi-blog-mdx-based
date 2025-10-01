// components/CalloutWithImage.tsx
"use client";

import { cn } from "@/lib/utils";

export function CalloutWithImage({
  children,
  image,
  alt,
  className,
}: {
  children: React.ReactNode;
  image: string;
  alt?: string;
  className?: string;
}) {
  return (
    <div className={cn("my-6 flex items-start gap-4", className)}>
      <div className="flex-1 flex-col">
        {children}
      </div>
      <img
        src={image}
        alt={alt}
        className="rounded-lg border object-cover"
      />
    </div>
  );
}
