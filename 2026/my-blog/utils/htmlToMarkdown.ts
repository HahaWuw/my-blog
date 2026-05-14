import TurndownService from "turndown"

let turndownService: TurndownService | null = null

function getTurndownService(): TurndownService {
  if (!turndownService) {
    turndownService = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      bulletListMarker: "-",
    })
    // 删除线：<del>/<s> → ~~text~~（GFM 支持）
    turndownService.addRule("strikethrough", {
      filter: (node) =>
        node.nodeName === "DEL" ||
        node.nodeName === "S" ||
        node.nodeName === "STRIKE",
      replacement: (content) => "~~" + content + "~~",
    })
    // 保留表格为 HTML，避免转换丢失，由 rehype-raw 渲染
    turndownService.keep(["table", "thead", "tbody", "tr", "th", "td"])
  }
  return turndownService
}

/**
 * 将富文本 HTML 转为 Markdown 字符串
 * @param html 富文本 HTML（如 wangeditor 输出的内容）
 * @returns Markdown 字符串
 */
export function htmlToMarkdown(html: string): string {
  if (!html || typeof html !== "string") return ""
  const service = getTurndownService()
  try {
    return service.turndown(html)
  } catch {
    return html
  }
}
