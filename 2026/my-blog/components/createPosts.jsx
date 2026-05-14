"use client"
import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import MarkdownWithHighlight from "@/components/MarkdownWithHighlight"

export default function CreatePost() {
    const [ title, setTitle ] = useState('')
    const [ content, setContent ] = useState('')
    const [ showPreview, setShowPreview ] = useState(false)

    const handelSubmit = async (e) => {
        e.preventDefault()
        const supabase = await createClient()
        const { data, error } = await supabase.from('posts').insert([
            { title, content, author_id: '', slug: '4' }
        ]).select()
        if(error) {
          console.log(error)
        } else {
          console.log(data)
        }
        location.reload()
    }

    return (
      <div className="flex items-center justify-center mt-20">
        <form className="max-w-4xl w-full bg-white rounded-xl shadow-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 text-center">
            生成一篇文章
          </h2>

          <input
            type="text"
            placeholder="文章标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className={`px-4 py-2 rounded text-sm ${
                !showPreview 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              编辑
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className={`px-4 py-2 rounded text-sm ${
                showPreview 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              预览
            </button>
          </div>

          {showPreview ? (
            // 使用 ReactMarkdown 渲染预览
            <div className="w-full min-h-[300px] p-4 border border-gray-300 rounded-lg 
                          bg-gray-50 overflow-y-auto">
              <MarkdownWithHighlight>{content || '*暂无内容*'}</MarkdownWithHighlight>
            </div>
          ) : (
            <textarea
              placeholder="文章内容（支持 Markdown 格式）&#10;&#10;例如：&#10;# 标题&#10;**粗体** *斜体*&#10;- 列表项"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[300px] rounded-lg border border-gray-300 px-4 py-2 text-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          )}

          <button
            type="submit"
            onClick={handelSubmit}
            className="w-full rounded-lg bg-blue-600 py-2 text-white font-medium
                      hover:bg-blue-700 transition"
          >
            提交
          </button>
        </form>
      </div>
    )
}