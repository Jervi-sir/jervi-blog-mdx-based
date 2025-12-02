// app/admin/posts/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  bodyMarkdown: string;
  tags: string[];
  thumbnailUrl: string | null;
  published: boolean;
  publishedAt: string | null;
  views: number;
  createdAt: string;
  updatedAt: string;
};

type PostFormState = {
  slug: string;
  title: string;
  description: string;
  bodyMarkdown: string;
  tags: string; // comma-separated in the UI
  thumbnailUrl: string;
  published: boolean;
};

const emptyForm: PostFormState = {
  slug: "",
  title: "",
  description: "",
  bodyMarkdown: "",
  tags: "",
  thumbnailUrl: "",
  published: false,
};

export default function AdminPostsPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedId, setSelectedId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<PostFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0); // 🔑 force iframe reload

  // Load posts
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/admin/posts");
        if (!res.ok) throw new Error("Failed to load posts");
        const json = (await res.json()) as BlogPost[];
        setPosts(json);
      } catch (e) {
        console.error(e);
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  // When selecting a post or "new"
  useEffect(() => {
    if (selectedId === "new") {
      setForm(emptyForm);
      setError(null);
      return;
    }

    if (!selectedId) return;

    const p = posts.find((p) => p.id === selectedId);
    if (!p) return;

    setForm({
      slug: p.slug,
      title: p.title,
      description: p.description ?? "",
      bodyMarkdown: p.bodyMarkdown,
      tags: p.tags.join(", "),
      thumbnailUrl: p.thumbnailUrl ?? "",
      published: p.published,
    });
    setError(null);
    setPreviewKey((k) => k + 1); // refresh preview when switching post
  }, [selectedId, posts]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleTogglePublished(value: boolean) {
    setForm((f) => ({ ...f, published: value }));
  }

  function generateSlugFromTitle() {
    if (!form.title) return;
    const slug = form.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    setForm((f) => ({ ...f, slug }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      if (!form.slug || !form.title || !form.bodyMarkdown) {
        setError("Slug, title and body are required");
        setSaving(false);
        return;
      }

      const payload = {
        slug: form.slug.trim(),
        title: form.title.trim(),
        description: form.description.trim() || null,
        bodyMarkdown: form.bodyMarkdown,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        thumbnailUrl: form.thumbnailUrl.trim() || null,
        published: form.published,
      };

      let res: Response;
      if (selectedId && selectedId !== "new") {
        res = await fetch(`/api/admin/posts/${selectedId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? "Failed to save post");
        setSaving(false);
        return;
      }

      // Refresh list
      const listRes = await fetch("/api/admin/posts");
      const listJson = (await listRes.json()) as BlogPost[];
      setPosts(listJson);

      if (selectedId === "new") {
        setSelectedId(json.id);
      }

      router.refresh();
      setPreviewKey((k) => k + 1); // reload preview after save
    } catch (e) {
      console.error(e);
      setError("Network error while saving");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedId || selectedId === "new") return;
    if (!confirm("Delete this post?")) return;

    try {
      const res = await fetch(`/api/admin/posts/${selectedId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError("Failed to delete post");
        return;
      }

      setPosts((prev) => prev.filter((p) => p.id !== selectedId));
      setSelectedId(null);
      setForm(emptyForm);
      router.refresh();
      setPreviewKey((k) => k + 1);
    } catch (e) {
      console.error(e);
      setError("Network error while deleting");
    }
  }

  const selectedPost = selectedId
    ? posts.find((p) => p.id === selectedId)
    : null;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-border p-4 space-y-4 bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-semibold text-sm">Posts</h1>
          <Button
            size="sm"
            onClick={() => {
              setSelectedId("new");
              setForm(emptyForm);
            }}
          >
            New
          </Button>
        </div>

        {loading ? (
          <p className="text-xs text-muted-foreground">Loading posts…</p>
        ) : posts.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No posts yet. Create one!
          </p>
        ) : (
          <div className="space-y-1 text-sm">
            {posts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => setSelectedId(post.id)}
                className={cn(
                  "w-full text-left px-2 py-1.5 rounded-md hover:bg-accent",
                  selectedId === post.id && "bg-accent"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{post.title}</span>
                  {post.published && (
                    <span className="text-[10px] uppercase text-green-600">
                      live
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  /blog/{post.slug}
                </div>
              </button>
            ))}
          </div>
        )}
      </aside>

      {/* Editor */}
      <main className="flex-1 p-4 md:p-6 space-y-4">
        {/* Top bar with meta info + actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">
              {selectedId === "new"
                ? "New post"
                : selectedId
                ? "Edit post"
                : "Select a post"}
            </h2>
            {selectedPost && (
              <p className="text-xs text-muted-foreground">
                Created{" "}
                {new Date(selectedPost.createdAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}{" "}
                · Views: {selectedPost.views}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {form.slug && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.push(`/blog/${form.slug}`)}
              >
                Open live page
              </Button>
            )}

            <div className="flex items-center gap-2">
              <Switch
                id="published"
                checked={form.published}
                onCheckedChange={handleTogglePublished}
              />
              <Label htmlFor="published" className="text-sm">
                Published
              </Label>
            </div>

            {selectedId && selectedId !== "new" && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={saving}
              >
                Delete
              </Button>
            )}

            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || !form.slug || !form.title}
            >
              {saving ? "Saving…" : "Save"}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreviewKey((k) => k + 1)}
              disabled={!form.slug}
            >
              Reload preview
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {selectedId ? (
          <div className="space-y-6">
            {/* 🔝 Post details (full width, responsive grid) */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="title">Title</Label>
                  </div>
                  <Input
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="My first blog post"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Button
                      variant="outline"
                      type="button"
                      size="sm"
                      onClick={generateSlugFromTitle}
                    >
                      From title
                    </Button>
                  </div>
                  <Input
                    id="slug"
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    placeholder="my-first-blog-post"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={form.tags}
                    onChange={handleChange}
                    placeholder="nextjs, prisma, markdown"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Short SEO description"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                  <Input
                    id="thumbnailUrl"
                    name="thumbnailUrl"
                    value={form.thumbnailUrl}
                    onChange={handleChange}
                    placeholder="https://…"
                  />
                  {form.thumbnailUrl && (
                    <p className="text-[11px] text-muted-foreground">
                      This is just a URL, your blog page will decide how to
                      render it.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 🔻 Split: editor (left) / sticky preview (right) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bodyMarkdown">Body (Markdown / MDX)</Label>
                <span className="text-xs text-muted-foreground">
                  Preview uses the real /blog page (MDXRemote)
                </span>
              </div>

              <div className="grid gap-4 lg:grid-cols-2 items-start">
                {/* Left: editor */}
                <div>
                  <Textarea
                    id="bodyMarkdown"
                    name="bodyMarkdown"
                    value={form.bodyMarkdown}
                    onChange={handleChange}
                    rows={18}
                    className="font-mono text-xs min-h-[300px] md:min-h-[400px] lg:min-h-[600px]"
                    placeholder={`# Hello\n\nThis is **MDX**.\n\n- item 1\n- item 2`}
                  />
                </div>

                {/* Right: preview */}
                <div className="lg:sticky lg:top-20 self-start">
                  <div className="border rounded-md bg-muted/40 overflow-hidden max-h-[400px] md:max-h-[500px] lg:max-h-[calc(100vh-6rem)]">
                    {form.slug ? (
                      <iframe
                        key={previewKey}
                        src={`/blog/${form.slug}?preview=1`}
                        className="w-full h-[300px] md:h-[400px] lg:h-[calc(100vh-6rem)] border-0"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center p-4">
                        <p className="text-xs text-muted-foreground text-center">
                          Set a slug and save the post to see a preview here.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a post from the left, or click <b>New</b> to create one.
          </p>
        )}
      </main>
    </div>
  );
}
