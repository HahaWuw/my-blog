import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import LoginForm from '@/components/LoginForm'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 如果已登录，重定向到首页
  if (user) {
    redirect('/')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">登录</h1>
          <Suspense fallback={<p className="text-center text-gray-500">加载中…</p>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

