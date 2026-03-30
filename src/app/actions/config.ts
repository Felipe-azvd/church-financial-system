'use server'

import { getTenantPrisma } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createConfigItem(type: 'categoria' | 'culto', nome: string, itemTipo?: string) {
  const { db, tenantId, user } = await getTenantPrisma()

  if (!user.permissions.includes('configuracoes.editar')) {
    throw new Error('Acesso negado. Apenas usuários com permissão podem gerenciar configurações.')
  }

  if (type === 'categoria') {
    await db.categoria.create({ data: { nome, tipo: itemTipo || 'AMBOS', igreja_id: tenantId } })
  } else if (type === 'culto') {
    await db.culto.create({ data: { nome, igreja_id: tenantId } })
  }

  revalidatePath('/configuracoes')
}

export async function updateConfigItem(type: 'categoria' | 'culto', id: string, nome: string, itemTipo?: string) {
  const { db, tenantId, user } = await getTenantPrisma()

  if (!user.permissions.includes('configuracoes.editar')) {
    throw new Error('Acesso negado. Apenas usuários com permissão podem gerenciar configurações.')
  }

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

  if (!user.permissions.includes('configuracoes.editar')) {
    throw new Error('Acesso negado. Apenas usuários com permissão podem gerenciar configurações.')
  }

  if (type === 'categoria') {
    await db.categoria.deleteMany({ where: { id, igreja_id: tenantId } })
  } else if (type === 'culto') {
    await db.culto.deleteMany({ where: { id, igreja_id: tenantId } })
  }

  revalidatePath('/configuracoes')
}
