import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
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
    <div className="app-layout gap-6">
      <Sidebar userPermissions={user.permissions} />
      <div className="main-content">
        <Header userName={user.name || 'Usuário'} />
        <main className="flex-1 w-full px-6 py-6">
          <div className="w-full max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
