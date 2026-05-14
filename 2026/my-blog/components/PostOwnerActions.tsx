"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Props = {
  slug: string
}

export default function PostOwnerActions({ slug }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async () => {
    if (!confirm("确定删除这篇文章？删除后无法恢复。")) return
    setError("")
    setDeleting(true)
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(slug)}`, {
        method: "DELETE",
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(
          typeof payload.error === "string"
            ? payload.error
            : "删除失败，请稍后重试"
        )
        return
      }
      router.push("/posts/list")
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除失败，请稍后重试")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
      <Link
        href={`/posts/${encodeURIComponent(slug)}/edit`}
        className="inline-flex px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
      >
        编辑文章
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="inline-flex px-4 py-2 rounded-lg border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-50 transition"
      >
        {deleting ? "删除中…" : "删除文章"}
      </button>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 w-full">{error}</p>
      )}
    </div>
  )
}
