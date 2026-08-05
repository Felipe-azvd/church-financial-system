import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { cookies } from "next/headers"
import { prisma } from "./prisma"
import { prismaTenant } from "./prisma-tenant"

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

// 🔥 FUNÇÃO BLINDADA E INTELIGENTE
export async function checkPermission(arg1: any, arg2?: string) {
  let user;
  let permission;

  if (typeof arg1 === 'string') {
    user = await getCurrentUser();
    permission = arg1;
  } else {
    user = arg1;
    permission = arg2;
  }

  // 1. O GOD MODE ABSOLUTO GLOBAL (Agora usa is_superadmin, exclusivo seu!)
  if (user?.is_superadmin === true) {
    return user;
  }

  // 2. CORINGA DE SEGURANÇA: Se a sessão tiver o [*]
  if (user?.permissions?.includes('*')) {
    return user;
  }

  // 3. CHECAGEM NORMAL DE USUÁRIO COMUM
  if (!user?.permissions?.includes(permission)) {
    throw new UnauthorizedError(`Acesso negado. Permissão necessária: ${permission}`);
  }

  return user;
}

// Duas igrejas pertencem à mesma rede se uma for a matriz da outra, ou se
// ambas forem filiais da mesma matriz.
export async function pertenceMesmaRede(igrejaIdA: string, igrejaIdB: string): Promise<boolean> {
  if (igrejaIdA === igrejaIdB) return true

  const [a, b] = await Promise.all([
    prisma.igreja.findUnique({ where: { id: igrejaIdA }, select: { matriz_id: true } }),
    prisma.igreja.findUnique({ where: { id: igrejaIdB }, select: { matriz_id: true } }),
  ])
  if (!a || !b) return false

  const rootA = a.matriz_id ?? igrejaIdA
  const rootB = b.matriz_id ?? igrejaIdB
  return rootA === rootB
}

export async function resolveActiveTenantId(user: { igreja_id: string | null; is_superadmin?: boolean }): Promise<string> {
  if (!user.igreja_id) {
    throw new Error("Tenant não encontrado")
  }

  const cookieStore = await cookies();

  // 🔥 Super Admin em modo suporte pode olhar pelo "buraco da fechadura" usando o cookie.
  // Tem prioridade sobre a troca de matriz/filial abaixo.
  if (user.is_superadmin) {
    const masterTenantId = cookieStore.get('master_tenant_id')?.value;
    if (masterTenantId) {
      return masterTenantId;
    }
  }

  // Troca entre matriz/filiais: só é respeitada se a igreja de destino
  // pertencer à mesma rede da igreja original do usuário.
  const activeIgrejaId = cookieStore.get('igreja_id')?.value;
  if (activeIgrejaId && activeIgrejaId !== user.igreja_id) {
    const pertence = await pertenceMesmaRede(user.igreja_id, activeIgrejaId);
    if (pertence) {
      return activeIgrejaId;
    }
  }

  return user.igreja_id;
}

export async function getTenantPrisma() {
  const user = await getCurrentUser()
  const tenantId = await resolveActiveTenantId(user)

  return {
    db: prismaTenant,
    tenantId,
    user
  }
}