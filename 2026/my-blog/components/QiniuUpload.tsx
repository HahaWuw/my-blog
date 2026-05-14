"use client"

import { useState, useRef } from "react"
import { uploadToQiniu } from "@/utils/qiniuUpload"

type Props = {
  onSuccess: (url: string) => void
  accept?: string
  maxSize?: number
  className?: string
  children?: React.ReactNode
}

/**
 * 七牛云附件上传组件：选择文件后直传七牛，成功后回调文件 URL
 */
export default function QiniuUpload({
  onSuccess,
  accept = "*",
  maxSize = 10 * 1024 * 1024,
  className = "",
  children,
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""
    setError("")
    if (file.size > maxSize) {
      setError(`文件大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`)
      return
    }
    setUploading(true)
    setProgress(0)
    try {
      const url = await uploadToQiniu(file, setProgress)
      onSuccess(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败")
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={uploading}
        className="hidden"
      />
      {children ? (
        <span onClick={() => inputRef.current?.click()}>{children}</span>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition"
        >
          {uploading ? `上传中 ${progress}%` : "选择附件上传"}
        </button>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
      {uploading && (
        <div className="mt-2 h-1.5 w-40 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
