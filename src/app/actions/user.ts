'use server'

import { getTenantPrisma } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import bcrypt from 'bcryptjs'

export async function createUser(data: { nome: string; email: string; senha?: string; role_id: string }) {
  try {
    const { db, tenantId, user } = await getTenantPrisma()

    if (!user.permissions.includes('usuarios.criar') && !user.permissions.includes('*')) {
      return { success: false, error: 'Acesso negado. Você não tem permissão para criar usuários.' }
    }

    // Valida se o email já existe
    const existingUser = await db.usuario.findFirst({
      where: { email: data.email, igreja_id: tenantId }
    })

    if (existingUser) {
      return { success: false, error: 'Já existe um usuário com este email na sua igreja.' }
    }

    const hashedPassword = data.senha ? await bcrypt.hash(data.senha, 10) : ''

    await db.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha: hashedPassword,
        role_id: data.role_id,
        igreja_id: tenantId,
      }
    })

    revalidatePath('/usuarios')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: 'Erro interno ao criar usuário. Tente novamente.' }
  }
}

export async function updateUser(id: string, data: { nome: string; email: string; senha?: string; role_id: string }) {
  try {
    const { db, tenantId, user } = await getTenantPrisma()

    if (!user.permissions.includes('usuarios.editar') && !user.permissions.includes('*')) {
      return { success: false, error: 'Acesso negado. Você não tem permissão para editar usuários.' }
    }

    const targetUser = await db.usuario.findFirst({ where: { id, igreja_id: tenantId } })
    if (!targetUser) return { success: false, error: 'Usuário não encontrado.' }

    if (targetUser.email === 'felipeabreu.1994@gmail.com' && data.role_id !== targetUser.role_id) {
      return { success: false, error: 'Acesso negado. A permissão deste administrador padrão não pode ser alterada.' }
    }

    // Valida se o novo email já pertence a outra pessoa
    if (data.email !== targetUser.email) {
      const emailInUse = await db.usuario.findFirst({ where: { email: data.email, igreja_id: tenantId } })
      if (emailInUse) return { success: false, error: 'Este e-mail já está sendo usado por outro usuário.' }
    }

    const updateData: any = {
      nome: data.nome,
      email: data.email,
      role_id: data.role_id,
    }

    if (data.senha && data.senha.trim() !== '') {
      updateData.senha = await bcrypt.hash(data.senha, 10)
    }

    await db.usuario.update({
      where: { id },
      data: updateData
    })

    revalidatePath('/usuarios')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: 'Erro interno ao atualizar usuário. Tente novamente.' }
  }
}

export async function deleteUser(id: string) {
  try {
    const { db, tenantId, user } = await getTenantPrisma()

    if (!user.permissions.includes('usuarios.excluir') && !user.permissions.includes('*')) {
      return { success: false, error: 'Acesso negado. Você não tem permissão para excluir usuários.' }
    }

    if (id === user.id) {
      return { success: false, error: 'Você não pode excluir a si mesmo.' }
    }

    const targetUser = await db.usuario.findFirst({ where: { id, igreja_id: tenantId } })
    if (!targetUser) return { success: false, error: 'Usuário não encontrado.' }

    if (targetUser.email === 'felipeabreu.1994@gmail.com') {
      return { success: false, error: 'Acesso negado. O administrador padrão não pode ser excluído.' }
    }

    await db.usuario.delete({
      where: { id }
    })

    revalidatePath('/usuarios')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: 'Erro interno ao excluir usuário. Tente novamente.' }
  }
}