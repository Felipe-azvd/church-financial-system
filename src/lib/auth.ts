import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "./prisma"

export class UnauthorizedError extends Error {}

export async function getSessionUser() {
  const session = await getServerSession(authOptions)
  return session?.user ?? null
}

export async function getCurrentUser() {
  const user = await getSessionUser()

  if (!user) {
    throw new UnauthorizedError("Usuário não autenticado")
  }

  return user
}

export function checkPermission(user: any, permission: string) {
  if (!user?.permissions?.includes(permission)) {
    throw new UnauthorizedError("Acesso negado")
  }
}

export async function getTenantPrisma() {
  const user = await getCurrentUser()

  if (!user.igreja_id) {
    throw new Error("Tenant não encontrado")
  }

  return {
    db: prisma,
    tenantId: user.igreja_id, // 🔥 PADRONIZADO
    user
  }
}