/** 将标题或用户输入转为 URL 安全的 slug（小写、连字符） */
export function slugify(value: unknown): string {
  if (value == null || value === "") return ""
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
