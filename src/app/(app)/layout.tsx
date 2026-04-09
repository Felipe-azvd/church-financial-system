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
      
      {/* Menu Lateral Inteligente (Lida com Desktop e Mobile) */}
      <Sidebar userPermissions={user.permissions} userName={user.name || 'Usuário'} />

      {/* Conteúdo Principal: Responsividade aplicada no padding (p-4 pt-20 no mobile, p-8 no desktop) */}
      <main className="flex-1 overflow-y-auto w-full p-4 pt-24 md:p-8 md:pt-8 lg:p-10">
        <div className="w-full max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>

    </div>
  )
}