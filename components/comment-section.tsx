"use client";

import * as React from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type CommentItem = {
  id: string;
  name: string | null;
  content: string;
  createdAt: string;
  publicEmail?: string | null;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const STORAGE_KEY = "comment_profile_v1"; // { name, email, hideEmail }

export function CommentSection({ slug, className }: { slug: string; className?: string }) {
  const { data, isLoading, mutate } = useSWR<{ items: CommentItem[] }>(
    `/api/comments?slug=${encodeURIComponent(slug)}`,
    fetcher
  );

  const [form, setForm] = React.useState({ name: "", email: "", content: "" });
  const [hideEmail, setHideEmail] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);

  const [remember, setRemember] = React.useState(false);
  const [hasSavedProfile, setHasSavedProfile] = React.useState(false);

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState(false);

  // Load saved profile (if any) on mount
  React.useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (!raw) return;
      const parsed = JSON.parse(raw) as { name?: string; email?: string; hideEmail?: boolean };
      setForm((s) => ({
        ...s,
        name: parsed.name ?? "",
        email: parsed.email ?? "",
      }));
      if (typeof parsed.hideEmail === "boolean") setHideEmail(parsed.hideEmail);
      setRemember(true);
      setHasSavedProfile(Boolean(parsed.name || parsed.email));
    } catch {
      // ignore corrupted storage
    }
  }, []);

  // Persist or clear when relevant fields change
  React.useEffect(() => {
    try {
      if (!remember) {
        localStorage.removeItem(STORAGE_KEY);
        setHasSavedProfile(false);
        return;
      }
      const profile = {
        name: form.name?.trim(),
        email: form.email?.trim(),
        hideEmail,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      setHasSavedProfile(Boolean(profile.name || profile.email));
    } catch {
      // ignore storage errors (e.g., privacy mode)
    }
  }, [remember, form.name, form.email, hideEmail]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setOk(false);
    setError(null);
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          content: form.content,
          hideEmail,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? "Failed to post");
      } else {
        setOk(true);
        // If remembering, keep name/email and just clear the message.
        setForm((s) =>
          remember ? { ...s, content: "" } : { name: "", email: "", content: "" }
        );
        await mutate();
      }
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  function forgetProfile() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setHasSavedProfile(false);
    setRemember(false);
    // Do not clear current input; user may still want to post.
  }

  const items = data?.items ?? [];

  return (
    <section className={cn("mt-4", className)}>
      <div className="flex flex-row justify-between">
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Comments</h2>
        <div className="flex items-center gap-2">
          {/* Optional: surface "remember" toggle up top as well */}
          <div className="hidden sm:flex items-center gap-2">
            <Switch id="rememberTop" checked={remember} onCheckedChange={setRemember} />
            <Label htmlFor="rememberTop" className="text-sm">
              Remember me
            </Label>
          </div>
          <Button variant="outline" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Hide comment form" : "Add a comment"}
          </Button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="space-y-3 border rounded-lg p-4 bg-muted/40 mb-4">
          <div className="flex flex-col md:flex-row gap-3">
            <Input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Jane Dev"
              maxLength={80}
              className="border-none"
            />
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="jane@example.com"
              required
              maxLength={160}
              className="border-none"
            />
            <div className="flex items-center gap-2">
              <Switch id="hideEmail" checked={hideEmail} onCheckedChange={setHideEmail} />
              <Label htmlFor="hideEmail" className="text-sm">
                {hideEmail ? "Hide my email" : "Show my email"}
              </Label>
            </div>
          </div>

          {/* Remember toggle (mobile-visible) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:hidden">
              <Switch id="remember" checked={remember} onCheckedChange={setRemember} />
              <Label htmlFor="remember" className="text-sm">
                Remember me on this device
              </Label>
            </div>

            {hasSavedProfile && (
              <Button type="button" variant="ghost" size="sm" onClick={forgetProfile}>
                Forget saved info
              </Button>
            )}
          </div>

          <div className="relative">
            <Textarea
              name="content"
              value={form.content}
              onChange={onChange}
              placeholder="Share your thoughts…"
              required
              maxLength={2000}
              className="min-h-[46px] border-none"
            />

            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? "Posting…" : "Post comment"}
              </Button>
              {ok && <span className="text-sm text-green-600">Thanks! Comment posted.</span>}
              {error && <span className="text-sm text-red-600">{error}</span>}
            </div>
          </div>
        </form>
      )}

      <div className="mt-0 space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading comments…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
        ) : (
          items.map((c) => (
            <div key={c.id} className="border rounded-lg p-4 bg-card">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">
                  {c.name?.trim() || "Anonymous"}
                  {c.publicEmail ? (
                    <span className="ml-2 text-xs text-muted-foreground">({c.publicEmail})</span>
                  ) : null}
                </span>
                <time className="text-xs text-muted-foreground">
                  {format(new Date(c.createdAt), "PPP p")}
                </time>
              </div>
              <p className="text-sm mt-2 whitespace-pre-wrap">{c.content}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
