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

  // 🔥 BUSCA A REDE DA IGREJA E O NOME REAL
  const { db, tenantId } = await getTenantPrisma()
  const igreja = await db.igreja.findUnique({
    where: { id: tenantId },
    select: { id: true, nome: true, plano: true, matriz_id: true }
  })
  
  let churchNetwork: { id: string, nome: string, isMatriz: boolean }[] = []
  
  if (igreja) {
    if (igreja.plano === 'PREMIUM') {
      if (igreja.matriz_id === null) {
        // É a matriz
        const filiais = await db.igreja.findMany({ where: { matriz_id: igreja.id }, select: { id: true, nome: true }, orderBy: { nome: 'asc' } })
        churchNetwork = [{ id: igreja.id, nome: igreja.nome, isMatriz: true }, ...filiais.map(f => ({ id: f.id, nome: f.nome, isMatriz: false }))]
      } else {
        // É uma filial
        const matriz = await db.igreja.findUnique({ where: { id: igreja.matriz_id }, select: { id: true, nome: true } })
        const outrasFiliais = await db.igreja.findMany({ where: { matriz_id: igreja.matriz_id }, select: { id: true, nome: true }, orderBy: { nome: 'asc' } })
        
        if (matriz) churchNetwork.push({ id: matriz.id, nome: matriz.nome, isMatriz: true })
        churchNetwork.push(...outrasFiliais.map(f => ({ id: f.id, nome: f.nome, isMatriz: false })))
      }
    } else {
      // Plano normal
      churchNetwork = [{ id: igreja.id, nome: igreja.nome, isMatriz: true }]
    }
  }

  // Se tiver nome no banco, usa ele. Se não, mostra um aviso.
  const nomeDaIgreja = igreja?.nome || "Igreja não configurada"

  return (
    <div className="flex h-screen overflow-hidden">
      
      {/* Menu Lateral Inteligente (Lida com Desktop e Mobile) */}
      <Sidebar 
        userPermissions={user.permissions} 
        userName={user.name || 'Usuário'} 
        churchName={nomeDaIgreja} 
        churchNetwork={churchNetwork} // 🔥 NOVO: PASSA A REDE DE IGREJAS
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