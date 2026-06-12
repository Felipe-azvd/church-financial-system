'use server'

import { registrarLog } from "@/lib/logger"
import { getTenantPrisma } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const updateRoleSchema = z.object({
  id: z.string().min(1, "ID da função é obrigatório"),
  nome: z.string().min(2, "Nome da função deve ter pelo menos 2 caracteres"),
  permission_ids: z.array(z.string()).optional().default([]),
})

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

  await registrarLog("CRIAR_FUNCAO", `Função ${nome} criada`, "Role", null)
  revalidatePath('/funcoes')
  revalidatePath('/usuarios')
}

export async function updateRole(id: string, nome: string, permission_ids: string[] = []) {
  try {
    const parsed = updateRoleSchema.safeParse({ id, nome, permission_ids })
    if (!parsed.success) {
      return { success: false, message: "Dados inválidos: " + parsed.error.issues.map(e => e.message).join(', ') }
    }

    const { db, tenantId, user } = await getTenantPrisma()

    if (!user.permissions.includes('funcoes.editar')) {
      return { success: false, message: 'Acesso negado' }
    }

    const role = await db.role.findFirst({ where: { id: parsed.data.id, igreja_id: tenantId }})
    if (!role) {
      return { success: false, message: 'Função não encontrada' }
    }

    if (['ADMINISTRADOR', 'TESOUREIRO', 'VISUALIZADOR'].includes(role.nome)) {
      return { success: false, message: 'Como medida de segurança, não é possível editar os cargos nativos do sistema.' }
    }

    await db.$transaction([
      db.rolePermission.deleteMany({
        where: { role_id: parsed.data.id }
      }),
      db.role.update({
        where: { id: parsed.data.id, igreja_id: tenantId },
        data: { 
          nome: parsed.data.nome, 
          role_permissions: {
            create: parsed.data.permission_ids.map(pid => ({ permission_id: pid }))
          }
        }
      })
    ])

    await registrarLog("EDITAR_FUNCAO", `Função ${parsed.data.nome} atualizada`, "Role", parsed.data.id)
    revalidatePath('/funcoes')
    revalidatePath('/usuarios')

    return { success: true }
  } catch (error) {
    console.error("Erro em updateRole:", error)
    return { success: false, message: "Ocorreu um erro interno ao atualizar a função." }
  }
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

  await registrarLog("EXCLUIR_FUNCAO", `Função excluída`, "Role", id)
  revalidatePath('/funcoes')
  revalidatePath('/usuarios')
}
