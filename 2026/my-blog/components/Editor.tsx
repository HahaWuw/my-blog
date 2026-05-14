"use client"

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react"

export type EditorHandle = {
  /** 在光标处插入 HTML，并同步到 onChange */
  insertHtml: (html: string) => void
}

type Props = { onChange?: (html: string) => void; initialHtml?: string }

const EditorComponent = forwardRef<EditorHandle, Props>(
  function EditorComponent({ onChange, initialHtml = "" }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const editorRef = useRef<{
      destroy: () => void
      txt: { html: (val?: string) => string | void }
      cmd: { do: (name: string, value?: string) => void }
    } | null>(null)
    const onChangeRef = useRef(onChange)
    onChangeRef.current = onChange
    const pendingInsertsRef = useRef<string[]>([])

    function applyInsert(editor: NonNullable<typeof editorRef.current>, html: string) {
      if (!html) return
      try {
        editor.cmd.do("insertHTML", html)
        const next = editor.txt.html() ?? ""
        onChangeRef.current?.(next)
      } catch {
        // insertHTML 在部分选区下可能失败，退化为追加整篇 HTML
        const cur = (editor.txt.html() as string) || ""
        editor.txt.html(cur + html)
        onChangeRef.current?.((editor.txt.html() as string) || "")
      }
    }

    function flushPending(editor: NonNullable<typeof editorRef.current>) {
      const pending = pendingInsertsRef.current.splice(
        0,
        pendingInsertsRef.current.length
      )
      for (const h of pending) {
        applyInsert(editor, h)
      }
    }

    useImperativeHandle(ref, () => ({
      insertHtml(html: string) {
        const ed = editorRef.current
        if (!ed) {
          pendingInsertsRef.current.push(html)
          return
        }
        applyInsert(ed, html)
      },
    }))

    useEffect(() => {
      const container = containerRef.current
      if (!container) return

      const startHtml = initialHtml || ""

      let mounted = true
      import("wangeditor").then((mod) => {
        if (!mounted || !container.isConnected) return
        const E = mod.default
        const editor = new E(container)
        editor.config.placeholder = "输入内容..."
        editor.config.onchange = (newHtml: string) => {
          onChangeRef.current?.(newHtml)
        }
        editor.create()
        editor.txt.html(startHtml)
        onChangeRef.current?.(startHtml)
        editorRef.current = editor
        flushPending(editor)
      })

      return () => {
        mounted = false
        const editor = editorRef.current
        editorRef.current = null
        if (editor) {
          try {
            editor.destroy()
          } catch {
            // 忽略卸载时 wangeditor 内部访问已移除 DOM 的报错
          }
        }
      }
    }, [])

    return (
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div ref={containerRef} className="min-h-[300px]" />
      </div>
    )
  }
)

EditorComponent.displayName = "Editor"

export default EditorComponent
