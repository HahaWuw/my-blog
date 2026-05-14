import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { notFound } from "next/navigation"
import MarkdownWithHighlight from "@/components/MarkdownWithHighlight"
import PostOwnerActions from "@/components/PostOwnerActions"

function formatDate(dateStr: string | null) {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: post, error } = await supabase
    .from("posts")
    .select("id, title, slug, content, created_at, updated_at, author_id")
    .eq("slug", slug)
    .single()

  if (error || !post) {
    notFound()
  }

  const isOwner = Boolean(user?.id && post.author_id === user.id)

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/posts/list"
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition"
      >
        ← 返回列表
      </Link>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">
          {post.title}
        </h1>
        <time
          dateTime={post.created_at || undefined}
          className="text-sm text-gray-500 dark:text-gray-400"
        >
          {formatDate(post.created_at)}
        </time>
      </header>
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <MarkdownWithHighlight>{post.content || ""}</MarkdownWithHighlight>
      </div>
      {isOwner ? <PostOwnerActions slug={post.slug} /> : null}
    </article>
  )
}
