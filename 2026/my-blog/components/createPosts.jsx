"use client"
import { useState } from "react"
import { createClient } from "@/utils/supabase/client";

export default  function CreatePost() {

    const [ title, setTitle ] = useState('')
    const [ content, setContent ] = useState('')

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
        <form className="max-w-sm bg-white rounded-xl shadow-lg p-6 space-y-4">
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

          <input
            type="text"
            placeholder="文章内容"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

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