import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { redirect } from "next/navigation"

function formatDate(dateStr: string | null) {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function stripMarkdown(text: string, maxLen = 120) {
  const plain = text
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*?|__?|~~?|`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim()
  return plain.length > maxLen ? plain.slice(0, maxLen) + "…" : plain
}

export default async function PostsListPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirect=" + encodeURIComponent("/posts/list"))
  }

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, content, created_at, updated_at")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-red-500">加载失败：{error.message}</p>
      </div>
    )
  }

  if (!posts?.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          暂无文章
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          写一篇试试？
        </p>
        <Link
          href="/posts/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          创建文章
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          我的文章
        </h1>
        <Link
          href="/posts/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
        >
          <span aria-hidden>+</span>
          写文章
        </Link>
      </div>

      <ul className="space-y-4">
        {posts.map((post) => {
          const summary = post.excerpt || stripMarkdown(post.content || "")
          return (
            <li key={post.id}>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-6 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 flex flex-col sm:flex-row sm:items-start gap-4">
                <Link
                  href={`/posts/${encodeURIComponent(post.slug)}`}
                  className="group flex-1 min-w-0 block"
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  {summary && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">
                      {summary}
                    </p>
                  )}
                  <time
                    dateTime={post.created_at || undefined}
                    className="text-xs text-gray-400 dark:text-gray-500"
                  >
                    {formatDate(post.created_at)}
                  </time>
                </Link>
                <Link
                  href={`/posts/${encodeURIComponent(post.slug)}/edit`}
                  className="shrink-0 self-start sm:self-center inline-flex px-3 py-1.5 rounded-lg text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition"
                >
                  编辑
                </Link>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
