"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

type PreProps = React.HTMLAttributes<HTMLPreElement> & {
  children?: React.ReactElement<{ className?: string; children?: React.ReactNode }>;
};

export default function CodeBlock({ children, className, ...rest }: PreProps) {
  const preRef = React.useRef<HTMLPreElement>(null);
  const [copied, setCopied] = React.useState(false);

  // Fallback flattener in case ref isn't ready
  const toText = (node: React.ReactNode): string =>
    node == null
      ? ""
      : typeof node === "string" || typeof node === "number"
        ? String(node)
        : Array.isArray(node)
          ? node.map(toText).join("")
          : React.isValidElement(node)
            ?
            // @ts-ignore
            toText(node.props.children)
            : "";

  const lang =
    ((children as any)?.props?.className || "")
      .replace("language-", "")
      .trim() || undefined;

  const onCopy = async () => {
    try {
      const domText = preRef.current?.innerText; // strips spans, keeps real code
      const fallback = toText((children as any)?.props?.children);
      const text = (domText ?? fallback).replace(/\s+$/g, ""); // trim trailing blanks
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch { }
  };

  return (
    <div className="my-4 rounded-xl bg-fd-card p-1 relative border outline-none not-prose overflow-hidden text-sm">
      {/* copy button */}
      <div className="h-8 w-8 empty:hidden absolute top-1 right-1 z-10 bg-fd-card rounded-bl-lg border-l border-b text-fd-muted-foreground">
        <button
          type="button"
          onClick={onCopy}
          aria-label="Copy code"
          className="cursor-pointer inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors duration-100 hover:bg-fd-accent hover:text-fd-accent-foreground [&_svg]:size-3.5"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* language pill (optional) */}
      {lang && (
        <span className="pointer-events-none absolute right-10 top-2.5 z-10 rounded-md border border-border/60 bg-background/70 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
          {lang}
        </span>
      )}

      {/* code */}
      <pre
        ref={preRef}
        {...rest}
        className={[
          "bg-fd-secondary rounded-lg border text-[13px] py-3.5 px-3 overflow-auto max-h-[600px] fd-scroll-container",
          className || "",
        ].join(" ")}
      >
        {children}
      </pre>
    </div>
  );
}
