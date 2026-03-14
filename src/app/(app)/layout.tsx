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
    <div className="app-layout">
      <Sidebar userPermissions={user.permissions} />
      <div className="main-content">
        <Header userName={user.name || 'Usuário'} />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  )
}
