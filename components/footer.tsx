import { Github } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border flex flex-col items-center justify-center gap-10 p-6 px-10">
      <div className="">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} M not a CEO so All rights free.
        </p>
      </div>
      <Link href={'https://github.com/Jervi-sir/jervi-blog-mdx-based'} target="_blank" className="flex flex-row gap-2 items-center">
        <span>👉</span>
        <Github />
        <span className="text-sm">Repo of this blog template </span>
        <span>👈</span>
      </Link>
    </footer>
  );
}
