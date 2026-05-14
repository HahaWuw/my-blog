import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-lg text-center">
      <h1 className="text-2xl font-bold mb-4">登录未完成</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        授权码无效或已过期。若使用 GitHub 登录，请在 Supabase 控制台 → Authentication → URL
        Configuration 中将本站地址与 <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1 rounded">/auth/callback</code>{" "}
        加入 Redirect URLs。
      </p>
      <Link
        href="/login"
        className="text-blue-600 dark:text-blue-400 underline"
      >
        返回登录
      </Link>
    </div>
  );
}
