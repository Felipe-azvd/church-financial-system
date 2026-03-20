import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "./prisma"

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message)
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden - Acesso Negado") {
    super(message)
    this.name = "ForbiddenError"
  }
}

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getSessionUser() {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new UnauthorizedError()
  }
  return {
    userId: session.user.id,
    igrejaId: session.user.igreja_id,
    role: session.user.role,
    permissions: session.user.permissions || []
  }
}

export async function checkPermission(requiredPermission: string) {
  const user = await getSessionUser()
  if (!user.permissions.includes(requiredPermission)) {
    throw new ForbiddenError(`Acesso negado. Permissão necessária: ${requiredPermission}`)
  }
  return user
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session?.user?.id) {
    return null
  }
  return session.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new UnauthorizedError()
  }
  return user
}

export async function getTenantPrisma() {
  const user = await requireAuth()
  
  // Custom prisma client wrapper to enforce church_id across all operations
  // Note: For simpler use cases like this, we'll return standard Prisma
  // and manually apply `{ where: { igreja_id: user.igreja_id } }` on each query.
  // Returning the `igreja_id` makes it easier to inject into queries.
  return {
    db: prisma,
    tenantId: user.igreja_id,
    user
  }
}

