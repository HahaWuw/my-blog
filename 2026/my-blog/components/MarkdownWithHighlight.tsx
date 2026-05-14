"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import rehypeRaw from "rehype-raw"
import "highlight.js/styles/atom-one-dark.css"

type Props = {
  children: string
  className?: string
}

/**
 * 渲染 Markdown，支持 GFM（表格、删除线等）、代码高亮、内容中的 HTML
 */
export default function MarkdownWithHighlight({ children, className = "" }: Props) {
  return (
    <div className={`markdown-body markdown-code-block ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
