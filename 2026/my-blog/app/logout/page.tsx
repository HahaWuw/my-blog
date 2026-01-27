"use client"
import { useUserStore } from '@/store/userStore'
import { useRouter } from 'next/navigation'
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {

  const { clearUser } = useUserStore()
  const router = useRouter()
  const handelLogout = async () => {
    const supabase = await createClient()
    await supabase.auth.signOut()
    console.log('清除登录信息')
    clearUser()
    router.push('/login')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">用户信息</h1>
          <button
            onClick={handelLogout}
            className="w-full rounded-lg bg-blue-600 py-2 text-white font-medium
                      hover:bg-blue-700 transition"
          >
            退出登录
          </button>
        </div>
      </div>
    </div>
  )
}

