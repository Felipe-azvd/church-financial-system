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

// 🔥 FUNÇÃO BLINDADA E INTELIGENTE
export async function checkPermission(arg1: any, arg2?: string) {
  let user;
  let permission;

  // Resolve se a página mandou (user, permissao) ou apenas ('permissao')
  if (typeof arg1 === 'string') {
    user = await getCurrentUser();
    permission = arg1;
  } else {
    user = arg1;
    permission = arg2;
  }

  // 1. O GOD MODE ABSOLUTO: Se for master, passa direto e ignora tudo!
  if (user?.is_master === true) {
    return user;
  }

  // 2. CORINGA DE SEGURANÇA: Se a sessão ainda tiver o [*], passa!
  if (user?.permissions?.includes('*')) {
    return user;
  }

  // 3. CHECAGEM NORMAL DE USUÁRIO COMUM
  if (!user?.permissions?.includes(permission)) {
    throw new UnauthorizedError(`Acesso negado. Permissão necessária: ${permission}`);
  }

  return user;
}

export async function getTenantPrisma() {
  const user = await getCurrentUser()

  if (!user.igreja_id) {
    throw new Error("Tenant não encontrado")
  }

  return {
    db: prisma,
    tenantId: user.igreja_id, 
    user
  }
}