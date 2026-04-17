'use server'

import { getTenantPrisma, checkPermission } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createConfigItem(type: 'categoria' | 'culto', nome: string, itemTipo?: string) {
  const { db, tenantId, user } = await getTenantPrisma()
  await checkPermission('configuracoes.editar')

  if (type === 'categoria') {
    await db.categoria.create({ data: { nome, tipo: itemTipo || 'AMBOS', igreja_id: tenantId } })
  } else if (type === 'culto') {
    await db.culto.create({ data: { nome, igreja_id: tenantId } })
  }
  revalidatePath('/configuracoes')
}

export async function updateConfigItem(type: 'categoria' | 'culto', id: string, nome: string, itemTipo?: string) {
  const { db, tenantId, user } = await getTenantPrisma()
  await checkPermission('configuracoes.editar')

  if (type === 'categoria') {
    await db.categoria.updateMany({ 
      where: { id, igreja_id: tenantId },
      data: { nome, tipo: itemTipo || 'AMBOS' } 
    })
  } else if (type === 'culto') {
    await db.culto.updateMany({ 
      where: { id, igreja_id: tenantId },
      data: { nome } 
    })
  }
  revalidatePath('/configuracoes')
}

export async function deleteConfigItem(type: 'categoria' | 'culto', id: string) {
  const { db, tenantId, user } = await getTenantPrisma()
  await checkPermission('configuracoes.editar')

  if (type === 'categoria') {
    await db.categoria.deleteMany({ where: { id, igreja_id: tenantId } })
  } else if (type === 'culto') {
    await db.culto.deleteMany({ where: { id, igreja_id: tenantId } })
  }
  revalidatePath('/configuracoes')
}

// 🔥 ISSO É O QUE FOI ADICIONADO: Função para buscar o nome da igreja
export async function getChurchName() {
  const { db, tenantId } = await getTenantPrisma()
  const igreja = await db.igreja.findUnique({
    where: { id: tenantId },
    select: { nome: true }
  })
  return igreja?.nome || ''
}

// 🔥 ISSO É O QUE FOI ADICIONADO: Função para salvar o novo nome da igreja
export async function updateChurchName(formData: FormData) {
  const { db, tenantId } = await getTenantPrisma()
  await checkPermission('configuracoes.editar')
  
  const nome = formData.get('nome') as string
  if (!nome || nome.trim() === '') return { success: false, error: 'O nome não pode ficar vazio' }

  try {
    await db.igreja.update({
      where: { id: tenantId },
      data: { nome: nome.trim() }
    })
    // Atualiza o menu lateral na hora
    revalidatePath('/', 'layout')
    revalidatePath('/configuracoes/personalizacao')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: 'Falha ao atualizar o nome.' }
  }
}