import Link from "next/link";
import { cn } from "@/lib/utils";

interface BlogCardProps {
  url: string;
  title: string;
  description: string;
  date: string;
  thumbnail?: string;
  showRightBorder?: boolean;
}

export function BlogCard({
  url,
  title,
  description,
  date,
}: BlogCardProps) {
  return (
    <Link
      href={url}
      className={cn(
        "group block relative before:absolute before:-left-0.5 before:top-0 before:z-10 before:w-px before:content-[''] after:absolute after:-top-0.5 after:left-0 after:z-0 after:w-screen after:content-['']",
        // "before:bg-border  after:bg-border",
        // showRightBorder && "md:border-r border-border border-b-0",
        "border rounded-xl",
        "h-40"
        // "max-w-3xl"
      )}
    >
      <div className="flex flex-row">
        {/* {thumbnail && (
          <div className="relative w-40 md:w-56 h-40 flex-shrink-0 overflow-hidden">
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 40vw, (max-width: 1200px) 25vw, 20vw"
            />
          </div>
        )} */}

        <div className="p-6 flex flex-col gap-2 justify-center">
          <h3 className="text-lg md:text-xl font-semibold text-card-foreground group-hover:underline underline-offset-4">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-3">
            {description}
          </p>
          <time className="block text-sm font-medium text-muted-foreground">
            {date}
          </time>
        </div>
      </div>
    </Link>
  );
}
