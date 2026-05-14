import EditPostForm from "@/components/EditPostForm"
import { markdownToHtml } from "@/utils/markdownToHtml"
import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function EditPostPage({
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
    .select("id, title, slug, content, author_id")
    .eq("slug", slug)
    .maybeSingle()

  if (error || !post) {
    notFound()
  }

  if (!user || post.author_id !== user.id) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          无权编辑此文章
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          只有作者本人可以编辑。
        </p>
        <Link
          href={`/posts/${encodeURIComponent(post.slug)}`}
          className="text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          返回文章
        </Link>
      </div>
    )
  }

  const initialHtml = markdownToHtml(post.content || "")

  return (
    <EditPostForm
      originalSlug={slug}
      initialTitle={post.title}
      initialSlug={post.slug}
      initialHtml={initialHtml}
    />
  )
}
