/* eslint-disable @next/next/no-img-element */
import { type Author } from "@/lib/authors";
import { cn } from "@/lib/utils";

interface AuthorCardProps {
  author?: Partial<Author>; // make props optional
  className?: string;
}

export function AuthorCard({ author, className }: AuthorCardProps) {
  const {
    avatar = "/jervi.png",
    name = "Jervi",
    position = "Needs a wife",
  } = author ?? {};

  return (
    <div className={cn("flex items-start gap-2", className)}>
      <img
        src={avatar}
        alt={name}
        className="rounded-full w-8 h-8 border border-border object-cover"
      />
      <div className="flex-1">
        <h3 className="text-sm tracking-tight text-balance font-semibold">
          {name}
        </h3>
        <p className="text-xs text-muted-foreground text-balance">
          {position}
        </p>
      </div>
    </div>
  );
}
