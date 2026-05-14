import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { getSupabasePublicEnv } from "@/utils/supabase/public-env";

/**
 * OAuth（GitHub 等）与邮箱验证链接使用 PKCE：Supabase 会重定向到此路由并带上 ?code=
 * 必须在此用 exchangeCodeForSession 把 code 换成会话并写入 Cookie。
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    next = "/";
  }

  const { url: sbUrl, anonKey } = getSupabasePublicEnv();
  const errorUrl = `${origin}/auth/auth-code-error`;

  if (!code || !sbUrl || !anonKey) {
    return NextResponse.redirect(errorUrl);
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";
  const redirectTarget = isLocal
    ? `${origin}${next}`
    : forwardedHost
      ? `https://${forwardedHost}${next}`
      : `${origin}${next}`;

  const response = NextResponse.redirect(redirectTarget);

  const supabase = createServerClient(sbUrl, anonKey, {
    cookies: {
      getAll() {
        const raw = parseCookieHeader(request.headers.get("cookie") ?? "")
        return raw.map((c) => ({
          name: c.name,
          value: c.value ?? "",
        }))
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("exchangeCodeForSession:", error.message);
    return NextResponse.redirect(errorUrl);
  }

  return response;
}
