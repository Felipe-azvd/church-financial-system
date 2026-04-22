import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options" // 🔥 Importando do local correto

export async function registrarLog(acao: string, descricao: string, entidade?: string, entidadeId?: string | null) {
  const session = await getServerSession(authOptions)
  
  // Fazemos um cast para 'any' para evitar brigas com o TypeScript 
  // enquanto os tipos do Session não estão totalmente mapeados
  const user = session?.user as any 

  if (!user) return

  try {
    // Se o erro no 'logAuditoria' persistir, rode: npx prisma generate
    await prisma.logAuditoria.create({
      data: {
        acao,
        descricao,
        entidade: entidade || "SISTEMA",
        entidadeId,
        usuario_id: user.id,
        igreja_id: user.igreja_id, 
      }
    })
  } catch (error) {
    console.error("Falha ao gravar log de auditoria:", error)
  }
}