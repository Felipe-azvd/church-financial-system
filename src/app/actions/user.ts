'use server'

import { getTenantPrisma } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import bcrypt from 'bcryptjs'

export async function createUser(data: { nome: string; email: string; senha?: string; role_id: string }) {
  const { db, tenantId, user } = await getTenantPrisma()

  if (!user.permissions.includes('usuarios.criar')) {
    throw new Error('Acesso negado. Você não tem permissão para criar usuários.')
  }

  // Validate email uniqueness within the tenant
  const existingUser = await db.usuario.findFirst({
    where: { email: data.email, igreja_id: tenantId }
  })

  if (existingUser) {
    throw new Error('Já existe um usuário com este email na sua igreja.')
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
}

export async function updateUser(id: string, data: { nome: string; email: string; senha?: string; role_id: string }) {
  const { db, tenantId, user } = await getTenantPrisma()

  if (!user.permissions.includes('usuarios.editar')) {
    throw new Error('Acesso negado. Você não tem permissão para editar usuários.')
  }

  // Verify ownership
  const targetUser = await db.usuario.findFirst({ where: { id, igreja_id: tenantId } })
  if (!targetUser) throw new Error('Unauthorized or not found')

  if (targetUser.email === 'felipeabreu.1994@gmail.com' && data.role_id !== targetUser.role_id) {
    throw new Error('Acesso negado. A permissão deste administrador padrão não pode ser alterada.')
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
}

export async function deleteUser(id: string) {
  const { db, tenantId, user } = await getTenantPrisma()

  if (!user.permissions.includes('usuarios.excluir')) {
    throw new Error('Acesso negado. Você não tem permissão para excluir usuários.')
  }

  if (id === user.id) {
    throw new Error('Você não pode excluir a si mesmo.')
  }

  const targetUser = await db.usuario.findFirst({ where: { id, igreja_id: tenantId } })
  if (!targetUser) throw new Error('Unauthorized or not found')

  if (targetUser.email === 'felipeabreu.1994@gmail.com') {
    throw new Error('Acesso negado. O administrador padrão não pode ser excluído.')
  }

  await db.usuario.delete({
    where: { id }
  })

  revalidatePath('/usuarios')
}
