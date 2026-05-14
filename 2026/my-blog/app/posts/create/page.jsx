"use client"
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Editor from "@/components/Editor";
import PostEditorQiniuUpload from "@/components/PostEditorQiniuUpload";
import { useUserStore } from "@/store/userStore";
import { htmlToMarkdown } from "@/utils/htmlToMarkdown";
import { slugify } from "@/utils/slug";

export default function Addarticle() {
    const router = useRouter();
    const { user, isAuthenticated } = useUserStore();
    const editorRef = useRef(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated || !user?.id) {
            setSubmitError('请先登录后再发布文章');
            return;
        }
        setSubmitError('');
        // 使用 state 中的 slug（input 没有 name 时 FormData 取不到值）
        const slugValue = slugify(slug || title);
        if (!slugValue) {
            setSubmitError('请填写文章标题或文章别名（URL）');
            return;
        }
        setIsSubmitting(true);
        try {
            const supabase = createClient();
            // 将富文本 HTML 转为 Markdown 再保存
            const contentMarkdown = htmlToMarkdown(content);
            const { data, error } = await supabase.from('posts').insert([
                { title, content: contentMarkdown, slug: slugValue, author_id: user.id }
            ]).select();

            if (error) {
                const isDuplicateSlug = error.code === "23505" || /duplicate key|unique constraint|idx_posts_slug/i.test(error.message || "");
                const isRls =
                    error.code === "42501" ||
                    /row-level security|violates row-level security/i.test(error.message || "");
                const isFkProfile =
                    error.code === "23503" ||
                    /fk_user_profiles_posts|foreign key constraint.*user_profiles/i.test(
                        error.message || ""
                    );
                setSubmitError(
                    isDuplicateSlug
                        ? "该文章别名（URL）已被使用，请换一个再提交"
                        : isRls
                          ? "没有权限写入文章：请在 Supabase SQL Editor 执行仓库内 supabase/policies/posts.sql。"
                          : isFkProfile
                            ? "当前账号在 user_profiles 中没有资料行，无法关联文章。请在 Supabase SQL Editor 执行 supabase/policies/user_profiles_sync.sql。"
                            : (error.message || "发布失败，请稍后重试")
                );
                console.error("Supabase insert error:", error);
                return;
            }
            if (data?.[0]?.slug) {
                router.push(`/posts/${encodeURIComponent(data[0].slug)}`);
                router.refresh();
            }
        } catch (err) {
            setSubmitError(err?.message || '发布失败，请稍后重试');
            console.error('Submit error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const [slug, setSlug] = useState('');

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">创建新文章</h1>
                    <Link
                        href="/"
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                    >
                        ← 返回
                    </Link>
                </div>
                <form className="space-y-4" onSubmit={ (e) => handleSubmit(e)}>
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium mb-2">
                        文章标题 <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="输入文章标题"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="slug" className="block text-sm font-medium mb-2">
                        文章别名 (URL) <span className="text-red-500">*</span>
                        </label>
                        <input
                        id="slug"
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="article-slug"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white font-mono text-sm"
                        disabled={isSubmitting}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        将作为文章的 URL 路径，例如：/posts/{slug || 'article-slug'}
                        </p>
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium mb-2">
                        文章内容 <span className="text-red-500">*</span>
                        </label>
                        <Editor ref={editorRef} onChange={(html) => setContent(html)} />
                        <PostEditorQiniuUpload editorRef={editorRef} disabled={isSubmitting} />
                    </div>
                    {submitError && (
                        <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
                    )}
                    {!isAuthenticated && (
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                            发布文章需要登录，请先 <Link href="/login" className="underline">登录</Link>。
                        </p>
                    )}
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50" disabled={!isAuthenticated || isSubmitting}>创建文章</button>
                </form>
            </div>
       </div>
    )
}