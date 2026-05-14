-- =============================================================================
-- 解决: insert or update on table "posts" violates foreign key constraint
--       "fk_user_profiles_posts"
--
-- 原因: posts.author_id 引用 user_profiles.id。只在 auth.users 里有账号、
--       但 public.user_profiles 没有对应行时，插入 posts 会失败。
--
-- 用法: Supabase Dashboard → SQL Editor → 整段执行（可先执行「回填」再建触发器）。
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A) 为「已经存在」的 auth 用户补一行 user_profiles（执行一次即可）
-- -----------------------------------------------------------------------------
INSERT INTO public.user_profiles (id, username, display_name, avatar_url, vip_level, is_admin)
SELECT
  u.id,
  COALESCE(
    NULLIF(TRIM(u.raw_user_meta_data->>'user_name'), ''),
    NULLIF(TRIM(u.raw_user_meta_data->>'preferred_username'), ''),
    NULLIF(TRIM(split_part(COALESCE(u.email, ''), '@', 1)), ''),
    'user'
  ) || '_' || substr(replace(u.id::text, '-', ''), 1, 8),
  COALESCE(
    NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(u.raw_user_meta_data->>'name'), ''),
    NULLIF(TRIM(split_part(COALESCE(u.email, ''), '@', 1)), ''),
    'User'
  ),
  NULLIF(TRIM(u.raw_user_meta_data->>'avatar_url'), ''),
  0,
  FALSE
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.user_profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- B) 新用户注册时自动插入 user_profiles（避免以后再缺行）
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username text;
  final_username text;
BEGIN
  base_username := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'user_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'preferred_username'), ''),
    NULLIF(TRIM(split_part(COALESCE(NEW.email, ''), '@', 1)), ''),
    'user'
  );
  final_username := base_username || '_' || substr(replace(NEW.id::text, '-', ''), 1, 8);

  INSERT INTO public.user_profiles (id, username, display_name, avatar_url, vip_level, is_admin)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
      base_username
    ),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'avatar_url'), ''),
    0,
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 若上句报错「syntax error at or near "FUNCTION"」，可改用（较老 PG 写法）:
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE PROCEDURE public.handle_new_user();
