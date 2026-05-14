-- 在 Supabase Dashboard → SQL Editor 中整段执行（可按需改策略名）。
-- 作用：修复「new row violates row-level security policy for table posts」与列表/详情读文章。
-- 若出现外键 fk_user_profiles_posts：先执行 supabase/policies/user_profiles_sync.sql。

-- 如已有同名策略，先删掉再执行下面 CREATE（或改策略名）。
DROP POLICY IF EXISTS "posts_select_public" ON public.posts;
DROP POLICY IF EXISTS "posts_insert_own" ON public.posts;
DROP POLICY IF EXISTS "posts_update_own" ON public.posts;
DROP POLICY IF EXISTS "posts_delete_own" ON public.posts;

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 匿名与登录用户均可读（博客列表、文章页用 anon 或服务端带 cookie 的 authenticated）
CREATE POLICY "posts_select_public"
ON public.posts
FOR SELECT
TO anon, authenticated
USING (true);

-- 仅允许插入「自己是作者」的行（与前端 author_id: user.id 一致）
CREATE POLICY "posts_insert_own"
ON public.posts
FOR INSERT
TO authenticated
WITH CHECK (author_id = auth.uid());

-- 仅本人可改、删自己的文章（可选，便于以后做编辑页）
CREATE POLICY "posts_update_own"
ON public.posts
FOR UPDATE
TO authenticated
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

CREATE POLICY "posts_delete_own"
ON public.posts
FOR DELETE
TO authenticated
USING (author_id = auth.uid());
