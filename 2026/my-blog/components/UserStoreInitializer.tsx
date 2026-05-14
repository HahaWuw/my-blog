"use client"

import { useEffect } from "react"
import { useUserStore } from "@/store/userStore"
import { createClient } from "@/utils/supabase/client"
import { isSupabasePublicEnvConfigured } from "@/utils/supabase/public-env"

/**
 * 挂载时拉取用户；并监听 Supabase 会话变化（OAuth 回跳、刷新 token、登出），
 * 否则会出现「已连上 Supabase 但界面仍像未登录、名字不更新」的情况。
 */
export default function UserStoreInitializer() {
  const initialize = useUserStore((s) => s.initialize)

  useEffect(() => {
    void initialize()
  }, [initialize])

  useEffect(() => {
    if (!isSupabasePublicEnvConfigured()) return

    let supabase: ReturnType<typeof createClient>
    try {
      supabase = createClient()
    } catch {
      return
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        void initialize()
      }
    })

    return () => subscription.unsubscribe()
  }, [initialize])

  return null
}
