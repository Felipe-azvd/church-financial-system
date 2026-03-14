'use server'

import { getTenantPrisma } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createTransaction(data: {
  descricao: string
  valor: number
  data: string
  tipo: string
  categoria_id?: string | null
  culto_id?: string | null
}) {
  const { db, tenantId, user } = await getTenantPrisma()

  if (!user.permissions.includes('lancamentos.criar')) {
    throw new Error('Acesso negado. Permissão necessária para criar lançamentos.')
  }

  await db.transacao.create({
    data: {
      descricao: data.descricao,
      valor: data.valor,
      data: new Date(data.data),
      tipo: data.tipo,
      categoria_id: data.categoria_id || null,
      culto_id: data.culto_id || null,
      igreja_id: tenantId,
      usuario_id: user.id
    }
  })

  revalidatePath('/lancamentos')
  revalidatePath('/lancamentos')
  revalidatePath('/dashboard')
}

export async function updateTransaction(id: string, data: {
  descricao: string
  valor: number
  data: string
  tipo: string
  categoria_id?: string | null
  culto_id?: string | null
}) {
  const { db, tenantId, user } = await getTenantPrisma()

  if (!user.permissions.includes('lancamentos.editar')) {
    throw new Error('Acesso negado. Permissão necessária para editar lançamentos.')
  }

  // Verify ownership before updating
  const tx = await db.transacao.findUnique({ where: { id } })
  if (!tx || tx.igreja_id !== tenantId) {
    throw new Error('Unauthorized or not found')
  }

  await db.transacao.update({
    where: { id },
    data: {
      descricao: data.descricao,
      valor: data.valor,
      data: new Date(data.data),
      tipo: data.tipo,
      categoria_id: data.categoria_id || null,
      culto_id: data.culto_id || null,
    }
  })

  revalidatePath('/lancamentos')
  revalidatePath('/dashboard')
}

export async function deleteTransaction(id: string) {
  const { db, tenantId, user } = await getTenantPrisma()

  if (!user.permissions.includes('lancamentos.excluir')) {
    throw new Error('Acesso negado. Permissão necessária para excluir lançamentos.')
  }

  // Verify ownership before deleting
  const tx = await db.transacao.findUnique({ where: { id } })
  if (!tx || tx.igreja_id !== tenantId) {
    throw new Error('Unauthorized or not found')
  }

  await db.transacao.delete({
    where: { id }
  })

  revalidatePath('/lancamentos')
  revalidatePath('/dashboard')
}

export async function getLookups() {
  const { db, tenantId } = await getTenantPrisma()

  const [categorias, cultos] = await Promise.all([
    db.categoria.findMany({ where: { igreja_id: tenantId } }),
    db.culto.findMany({ where: { igreja_id: tenantId } })
  ])

  return { categorias, cultos }
}
