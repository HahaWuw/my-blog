import Link from "next/link";

export default function Navigation() {
    return (
        <nav className="p-4 bg-purple-300 mx-auto shadow-lg w-full text-white">
            <div className="flex item-center justify-between w-3/5 mx-auto">
                <Link href='/' className="font-bold text-2xl transition-opacity">
                    React Hooks Demo
                </Link>
                <div className="ml-2">
                    <Link href='/' className="mr-4 py-2 px-3 text-black rounded text-white hover:font-bold">首页</Link>
                    <Link href='/login' className="mr-4 py-2 px-3 bg-blue-400 text-white rounded hover:bg-blue-500">登录</Link>
                    <Link href='/logout' className="mr-4 py-2 px-3 bg-blue-400 text-white rounded hover:bg-blue-500">退出登录</Link>
                </div>
            </div>
        </nav>
    )
}