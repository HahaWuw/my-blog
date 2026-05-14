"use client"
import { useState } from "react"
import MarkdownWithHighlight from "@/components/MarkdownWithHighlight"

/**
 * ReactMarkdown 使用示例组件
 * 
 * ReactMarkdown 是一个用于在 React 中渲染 Markdown 的组件
 * 基本用法：<ReactMarkdown>{markdown文本}</ReactMarkdown>
 */
export default function MarkdownExample() {
  const [markdown, setMarkdown] = useState(`# 欢迎使用 ReactMarkdown

这是一个 **Markdown** 渲染示例。

## 功能特性

- 支持标题
- 支持**粗体**和*斜体*
- 支持代码块
- 支持列表

### 代码示例

\`\`\`javascript
function hello() {
  console.log("Hello, ReactMarkdown!");
}
\`\`\`

### 链接和图片

[访问 GitHub](https://github.com)

> 这是一个引用块

- 无序列表项 1
- 无序列表项 2

1. 有序列表项 1
2. 有序列表项 2
`)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">ReactMarkdown 使用示例</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 左侧：Markdown 编辑器 */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Markdown 输入</h2>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm"
            placeholder="在这里输入 Markdown 文本..."
          />
        </div>

        {/* 右侧：渲染结果 */}
        <div>
          <h2 className="text-xl font-semibold mb-3">渲染结果</h2>
          <div className="w-full h-96 p-4 border border-gray-300 rounded-lg overflow-y-auto bg-gray-50">
            {/* 基本用法：直接传入 markdown 文本 */}
            <MarkdownWithHighlight>{markdown}</MarkdownWithHighlight>
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">使用说明：</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><code className="bg-gray-200 px-1 rounded">{"<ReactMarkdown>{markdown文本}</ReactMarkdown>"}</code> - 基本用法</li>
          <li>支持所有标准 Markdown 语法</li>
          <li>可以自定义样式和组件</li>
          <li>代码块已启用语法高亮</li>
        </ul>
      </div>
    </div>
  )
}
