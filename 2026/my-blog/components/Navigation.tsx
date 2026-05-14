"use client"

import Link from "next/link"
import { useUserStore } from "@/store/userStore"
import type { User, UserProfile } from "@/types/user"

function displayLabel(user: User | null, profile: UserProfile | null): string {
  if (profile?.display_name?.trim()) return profile.display_name.trim()
  if (profile?.username?.trim()) return profile.username.trim()
  if (!user) return ""
  const m = user.user_metadata ?? {}
  const fromMeta =
    (typeof m.full_name === "string" && m.full_name) ||
    (typeof m.name === "string" && m.name) ||
    (typeof m.user_name === "string" && m.user_name) ||
    (typeof m.preferred_username === "string" && m.preferred_username) ||
    ""
  if (fromMeta) return fromMeta
  if (user.email) return user.email
  return "已登录"
}

export default function Navigation() {
  const user = useUserStore((s) => s.user)
  const profile = useUserStore((s) => s.profile)
  const isAuthenticated = useUserStore((s) => s.isAuthenticated)
  const isLoading = useUserStore((s) => s.isLoading)

  const label = isAuthenticated ? displayLabel(user, profile) : ""

  return (
    <nav className="p-4 bg-purple-300 mx-auto shadow-lg w-full text-white">
      <div className="flex items-center justify-between w-3/5 mx-auto">
        <Link href="/" className="font-bold text-2xl transition-opacity">
          React Hooks Demo
        </Link>
        <div className="ml-2 flex items-center gap-3 flex-wrap justify-end">
          <Link
            href="/"
            className="mr-1 py-2 px-3 rounded text-white hover:font-bold"
          >
            首页
          </Link>
          <Link
            href="/posts/list"
            className="mr-1 py-2 px-3 rounded text-white hover:font-bold"
          >
            我的文章
          </Link>
          {isLoading ? (
            <span className="text-sm text-white/80 px-2">加载中…</span>
          ) : isAuthenticated ? (
            <>
              <span
                className="text-sm max-w-[200px] truncate text-white/95"
                title={label}
              >
                {label}
              </span>
              <Link
                href="/logout"
                className="py-2 px-3 bg-gray-700 text-white rounded hover:bg-gray-800"
              >
                退出
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="py-2 px-3 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
