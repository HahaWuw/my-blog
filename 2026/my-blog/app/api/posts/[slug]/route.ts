import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { slugify } from "@/utils/slug"

type Ctx = { params: Promise<{ slug: string }> }

export async function PATCH(request: Request, context: Ctx) {
  const { slug: routeSlug } = await context.params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  let body: { title?: unknown; content?: unknown; slug?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 })
  }

  const title = typeof body.title === "string" ? body.title.trim() : ""
  const content = typeof body.content === "string" ? body.content : ""
  const slugInput = typeof body.slug === "string" ? body.slug.trim() : ""

  if (!title) {
    return NextResponse.json({ error: "标题不能为空" }, { status: 400 })
  }
  if (!content) {
    return NextResponse.json({ error: "正文不能为空" }, { status: 400 })
  }

  const { data: row, error: fetchError } = await supabase
    .from("posts")
    .select("id, author_id, slug")
    .eq("slug", routeSlug)
    .maybeSingle()

  if (fetchError || !row) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 })
  }
  if (row.author_id !== user.id) {
    return NextResponse.json({ error: "无权修改该文章" }, { status: 403 })
  }

  const nextSlug = slugInput ? slugify(slugInput) : row.slug
  if (!nextSlug) {
    return NextResponse.json({ error: "文章别名（URL）无效" }, { status: 400 })
  }

  const { data: updated, error: updateError } = await supabase
    .from("posts")
    .update({
      title,
      content,
      slug: nextSlug,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .eq("author_id", user.id)
    .select("id, slug")
    .maybeSingle()

  if (updateError) {
    const isDuplicateSlug =
      updateError.code === "23505" ||
      /duplicate key|unique constraint|idx_posts_slug/i.test(updateError.message || "")
    return NextResponse.json(
      {
        error: isDuplicateSlug
          ? "该文章别名（URL）已被占用"
          : updateError.message || "更新失败",
      },
      { status: isDuplicateSlug ? 409 : 500 }
    )
  }

  if (!updated) {
    return NextResponse.json({ error: "更新失败：未写入任何行" }, { status: 500 })
  }

  return NextResponse.json({ ok: true, slug: updated.slug })
}

export async function DELETE(_request: Request, context: Ctx) {
  const { slug } = await context.params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  const { data: row, error: fetchError } = await supabase
    .from("posts")
    .select("id, author_id")
    .eq("slug", slug)
    .maybeSingle()

  if (fetchError || !row) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 })
  }
  if (row.author_id !== user.id) {
    return NextResponse.json({ error: "无权删除该文章" }, { status: 403 })
  }

  const { error: delError } = await supabase.from("posts").delete().eq("id", row.id)

  if (delError) {
    return NextResponse.json({ error: delError.message || "删除失败" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

/** 按 slug 查询单篇文章（JSON，供前端或其它客户端调用） */
export async function GET(_request: Request, context: Ctx) {
  const { slug } = await context.params
  const supabase = await createClient()
  const { data: post, error } = await supabase
    .from("posts")
    .select(
      "id, title, slug, content, excerpt, created_at, updated_at, author_id, published, is_public"
    )
    .eq("slug", slug)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!post) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 })
  }

  return NextResponse.json({ post })
}
