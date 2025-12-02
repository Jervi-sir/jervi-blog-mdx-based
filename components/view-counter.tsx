"use client";

import * as React from "react";
// import useSWR from "swr";

// const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function ViewCounter({ className, nb_views }: { nb_views?: number | null; className?: string }) {
  // const key = `/api/views?slug=${encodeURIComponent(slug)}`;
  // const { data, mutate } = useSWR<{ views: Record<string, number> }>(key, fetcher);

  // increment once on mount
  // React.useEffect(() => {
  //   const controller = new AbortController();
  //   fetch(key, { method: "POST", signal: controller.signal })
  //     .then(() => mutate())
  //     .catch(() => void 0);
  //   return () => controller.abort();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [slug]);

  // const count = data?.views?.[slug];

  return (
    <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-4 px-6 shadow-sm">
      <div className="flex flex-col gap-3">
        <span className={className}>
          {/* {typeof count === "number" ? `${count.toLocaleString()} views` : "— views"} <small>(By ip hashed)</small> */}
          {typeof nb_views === "number" ? `${nb_views.toLocaleString()} views` : "— views"} <small>(By ip hashed)</small>
        </span>
      </div>
    </div>
  );
}
