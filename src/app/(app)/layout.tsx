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
    <div className="flex h-screen overflow-hidden bg-[var(--bg-page)] relative text-[var(--text-color)]">
      {/* Luzes de Fundo (Ambient Blobs) */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-[var(--primary-color)] opacity-[0.08] rounded-full blur-[128px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0 hidden md:block"></div>
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-[#6366f1] opacity-[0.05] rounded-full blur-[128px] pointer-events-none translate-x-1/2 translate-y-1/2 z-0 hidden md:block"></div>

      {/* Menu Lateral */}
      <div className="relative z-10 h-full">
        <Sidebar userPermissions={user.permissions} userName={user.name || 'Usuário'} />
      </div>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto w-full p-8 lg:p-10 relative z-10">
        <div className="w-full max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
