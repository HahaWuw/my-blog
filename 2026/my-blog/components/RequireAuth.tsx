"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useUserStore } from "@/store/userStore"

type Props = {
  children: React.ReactNode
  /** 未登录时是否只提示而不跳转（默认 false，会跳转到登录页） */
  fallbackOnly?: boolean
}

/**
 * 包裹需要登录才能查看的内容。未登录时跳转登录页或显示提示。
 */
export default function RequireAuth({ children, fallbackOnly = false }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading } = useUserStore()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated && !fallbackOnly) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname || "/")}`)
    }
  }, [isAuthenticated, isLoading, fallbackOnly, pathname, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500">加载中...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    if (fallbackOnly) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] gap-4 p-6">
          <p className="text-gray-600 dark:text-gray-400">请登录后查看</p>
          <Link
            href={`/login?redirect=${encodeURIComponent(pathname || "/")}`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            去登录
          </Link>
        </div>
      )
    }
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500">跳转到登录页...</p>
      </div>
    )
  }

  return <>{children}</>
}
