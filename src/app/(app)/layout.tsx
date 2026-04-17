import Sidebar from "@/components/Sidebar"
import { getCurrentUser, getTenantPrisma } from "@/lib/auth" // 🔥 Adicionado getTenantPrisma
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

  // 🔥 BUSCA O NOME REAL DA IGREJA NO BANCO DE DADOS
  const { db, tenantId } = await getTenantPrisma()
  const igreja = await db.igreja.findUnique({
    where: { id: tenantId },
    select: { nome: true }
  })
  
  // Se tiver nome no banco, usa ele. Se não, mostra um aviso.
  const nomeDaIgreja = igreja?.nome || "Igreja não configurada"

  return (
    <div className="flex h-screen overflow-hidden">
      
      {/* Menu Lateral Inteligente (Lida com Desktop e Mobile) */}
      <Sidebar 
        userPermissions={user.permissions} 
        userName={user.name || 'Usuário'} 
        churchName={nomeDaIgreja} // 🔥 PASSA O NOME REAL PARA A SIDEBAR
      />

      {/* Conteúdo Principal: Responsividade aplicada no padding */}
      <main className="flex-1 overflow-y-auto w-full p-4 pt-24 md:p-8 md:pt-8 lg:p-10">
        <div className="w-full max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>

    </div>
  )
}