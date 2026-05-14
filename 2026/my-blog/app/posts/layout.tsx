import RequireAuth from "@/components/RequireAuth"

export default function PostsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RequireAuth>{children}</RequireAuth>
}
