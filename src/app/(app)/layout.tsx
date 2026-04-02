import Sidebar from "@/components/Sidebar"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userPermissions={user.permissions} userName={user.name || 'Usuário'} />
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 w-full px-6 pb-6 pt-6">
        <div className="w-full max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
