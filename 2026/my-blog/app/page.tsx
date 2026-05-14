import Link from "next/link";
export default async function Home() {
  return (
    <div className="py-10 px-5 mx-auto max-w-6xl">
      <h2 className="text-[#333] mb-5 text-center text-2xl hover:shadow-lg">欢迎来到我的个人博客训练课堂</h2>
      <p className="text-1xl text-center text-[#666]">
        这是一个综合性的React Hooks学习项目，包含登陆、创建/修改/删除/查文章
      </p>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-md px-5 py-10">
          <h3 className="text-[#667eee] mb-2 text-1xl">supabase初体验</h3>
          <p className="mb-3">使用supabase实现数据持久化，创建一篇文章</p>
          <Link href='/posts/create' className="px-2 py-2 bg-[#667eee] text-white rounded transition-all duration-300">查看示例</Link>
        </div>
      </div>
    </div>
  );
}
