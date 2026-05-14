import { marked } from "marked"

marked.setOptions({ gfm: true })

/**
 * 将 Markdown 转为 HTML，供 wangeditor 等富文本组件作为初始内容。
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown || typeof markdown !== "string") return ""
  try {
    return marked.parse(markdown, { async: false }) as string
  } catch {
    return ""
  }
}
