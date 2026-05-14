"use client"

import Editor, { type EditorHandle } from "@/components/Editor"
import PostEditorQiniuUpload from "@/components/PostEditorQiniuUpload"
import { htmlToMarkdown } from "@/utils/htmlToMarkdown"
import { slugify } from "@/utils/slug"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { useUserStore } from "@/store/userStore"

type Props = {
  originalSlug: string
  initialTitle: string
  initialSlug: string
  initialHtml: string
}

export default function EditPostForm({
  originalSlug,
  initialTitle,
  initialSlug,
  initialHtml,
}: Props) {
  const router = useRouter()
  const editorRef = useRef<EditorHandle | null>(null)
  const { isAuthenticated } = useUserStore()
  const [title, setTitle] = useState(initialTitle)
  const [slug, setSlug] = useState(initialSlug)
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      setSubmitError("请先登录")
      return
    }
    const slugValue = slugify(slug || title)
    if (!slugValue) {
      setSubmitError("请填写文章标题或文章别名（URL）")
      return
    }
    setSubmitError("")
    setIsSubmitting(true)
    try {
      const contentMarkdown = htmlToMarkdown(content)
      const res = await fetch(
        `/api/posts/${encodeURIComponent(originalSlug)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, slug, content: contentMarkdown }),
        }
      )
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSubmitError(
          typeof payload.error === "string"
            ? payload.error
            : "保存失败，请稍后重试"
        )
        return
      }
      const newSlug =
        typeof payload.slug === "string" ? payload.slug : slugValue
      router.push(`/posts/${encodeURIComponent(newSlug)}`)
      router.refresh()
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "保存失败，请稍后重试"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">编辑文章</h1>
          <Link
            href={`/posts/${encodeURIComponent(originalSlug)}`}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            ← 返回文章
          </Link>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              文章标题 <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium mb-2">
              文章别名 (URL) <span className="text-red-500">*</span>
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white font-mono text-sm"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              保存后文章地址为：/posts/{slugify(slug || title) || "…"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              文章内容 <span className="text-red-500">*</span>
            </label>
            <Editor
              ref={editorRef}
              key={originalSlug}
              initialHtml={initialHtml}
              onChange={(html) => setContent(html)}
            />
            <PostEditorQiniuUpload
              editorRef={editorRef}
              disabled={isSubmitting}
            />
          </div>
          {submitError && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {submitError}
            </p>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={!isAuthenticated || isSubmitting}
          >
            保存修改
          </button>
        </form>
      </div>
    </div>
  )
}
