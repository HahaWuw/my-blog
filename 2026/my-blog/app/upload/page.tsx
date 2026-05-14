"use client"

import { useState } from "react"
import QiniuUpload from "@/components/QiniuUpload"
import Link from "next/link"

export default function UploadPage() {
  const [url, setUrl] = useState("")

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">七牛云附件上传</h1>
      <QiniuUpload
        onSuccess={(fileUrl) => setUrl(fileUrl)}
        accept="*"
        maxSize={20 * 1024 * 1024}
      />
      {url && (
        <div className="mt-6 p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">上传成功，文件地址：</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 break-all hover:underline"
          >
            {url}
          </a>
        </div>
      )}
      <p className="mt-8 text-sm text-gray-500">
        <Link href="/" className="text-indigo-600 hover:underline">← 返回首页</Link>
      </p>
    </div>
  )
}
