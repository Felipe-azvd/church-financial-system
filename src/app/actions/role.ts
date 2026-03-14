'use server'

import { getTenantPrisma } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createRole(nome: string, permission_ids: string[] = []) {
  const { db, tenantId, user } = await getTenantPrisma()

  if (!user.permissions.includes('funcoes.criar')) {
    throw new Error('Acesso negado')
  }

  await db.role.create({
    data: {
      nome,
      igreja_id: tenantId,
      role_permissions: {
        create: permission_ids.map(id => ({ permission_id: id }))
      }
    }
  })

  revalidatePath('/funcoes')
  revalidatePath('/usuarios')
}

export async function updateRole(id: string, nome: string, permission_ids: string[] = []) {
  const { db, tenantId, user } = await getTenantPrisma()

  if (!user.permissions.includes('funcoes.editar')) {
    throw new Error('Acesso negado')
  }

  const role = await db.role.findFirst({ where: { id, igreja_id: tenantId }})
  if (role && ['ADMINISTRADOR', 'TESOUREIRO', 'VISUALIZADOR'].includes(role.nome)) {
    throw new Error('Como medida de segurança, não é possível editar os cargos nativos do sistema.')
  }

  await db.role.update({
    where: { id },
    data: { 
      nome, 
      role_permissions: {
        deleteMany: {},
        create: permission_ids.map(pid => ({ permission_id: pid }))
      }
    }
  })

  revalidatePath('/funcoes')
  revalidatePath('/usuarios')
}

export async function deleteRole(id: string) {
  const { db, tenantId, user } = await getTenantPrisma()

  if (!user.permissions.includes('funcoes.excluir')) {
    throw new Error('Acesso negado')
  }

  // Prevent deleting standard roles to keep system integrity if needed
  const role = await db.role.findFirst({ where: { id, igreja_id: tenantId }})
  if (role && ['ADMINISTRADOR', 'TESOUREIRO', 'VISUALIZADOR'].includes(role.nome)) {
    throw new Error('Não é possível excluir funções fundamentais do sistema.')
  }

  await db.role.deleteMany({
    where: { id, igreja_id: tenantId }
  })

  revalidatePath('/funcoes')
  revalidatePath('/usuarios')
}
