'use server'

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

const CATEGORIAS_VALIDAS = ['Feature', 'Correção', 'Segurança', 'Infraestrutura', 'Design']

export async function criarEntradaChangelog(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || !user.permissions.includes('*')) {
    return { success: false, error: 'Acesso negado.' }
  }

  const categoria = formData.get('categoria') as string
  const titulo = (formData.get('titulo') as string)?.trim()
  const descricao = (formData.get('descricao') as string)?.trim()

  if (!CATEGORIAS_VALIDAS.includes(categoria) || !titulo || !descricao) {
    return { success: false, error: 'Preencha todos os campos corretamente.' }
  }

  await prisma.changelogInterno.create({
    data: { categoria, titulo, descricao }
  })

  revalidatePath('/super-admin/sistema/changelog')
  return { success: true }
}

export async function excluirEntradaChangelog(id: string) {
  const user = await getCurrentUser()
  if (!user || !user.permissions.includes('*')) {
    return { success: false, error: 'Acesso negado.' }
  }

  await prisma.changelogInterno.delete({ where: { id } })

  revalidatePath('/super-admin/sistema/changelog')
  return { success: true }
}
