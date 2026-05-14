"use client"

import QiniuUpload from "@/components/QiniuUpload"
import type { EditorHandle } from "@/components/Editor"

/** 将 URL 转为可安全放入 HTML 属性中的字符串 */
function escapeAttr(url: string): string {
  return url
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
}

/** 根据扩展名生成插入编辑器的一段 HTML（后续会经 turndown 存为 Markdown） */
export function htmlFragmentForUploadedUrl(url: string): string {
  const pathOnly = url.split(/[?#]/)[0] ?? url
  const isImage = /\.(png|jpe?g|gif|webp|svg|bmp|ico)$/i.test(pathOnly)
  const safe = escapeAttr(url)
  if (isImage) {
    return `<p><img src="${safe}" alt="上传图片" style="max-width:100%;height:auto;"/></p>`
  }
  return `<p><a href="${safe}" target="_blank" rel="noopener noreferrer">附件下载</a></p>`
}

type Props = {
  editorRef: React.RefObject<EditorHandle | null>
  disabled?: boolean
}

/**
 * 七牛上传成功后把图片或链接插入当前富文本编辑器光标处
 */
export default function PostEditorQiniuUpload({
  editorRef,
  disabled = false,
}: Props) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-3">
      <QiniuUpload
        accept="image/*,.pdf,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md"
        onSuccess={(url) => {
          editorRef.current?.insertHtml(htmlFragmentForUploadedUrl(url))
        }}
      >
        <button
          type="button"
          disabled={disabled}
          className="px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-800 text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 disabled:opacity-50 disabled:pointer-events-none transition"
        >
          上传文件插入正文
        </button>
      </QiniuUpload>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        走七牛直传；图片插入为图，其它文件为下载链接（最大 10MB）
      </span>
    </div>
  )
}
