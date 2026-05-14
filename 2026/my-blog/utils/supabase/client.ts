import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "./public-env";

export const createClient = () => {
  const { url, anonKey } = getSupabasePublicEnv();
  if (!url || !anonKey) {
    throw new Error(
      "缺少 Supabase 环境变量：请在 .env.local 中配置 NEXT_PUBLIC_SUPABASE_URL，以及 NEXT_PUBLIC_SUPABASE_ANON_KEY 或 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY（项目 Settings → API 中的 anon public key）。"
    );
  }
  return createBrowserClient(url, anonKey);
};
