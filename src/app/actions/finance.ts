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

export async function getFinancialSummary(ano: number) {
  const { db, tenantId } = await getTenantPrisma()
  const startDate = new Date(`${ano}-01-01T00:00:00.000Z`)
  const endDate = new Date(`${ano}-12-31T23:59:59.999Z`)

  const entradas = await db.transacao.aggregate({
    _sum: { valor: true },
    where: { 
      igreja_id: tenantId, 
      tipo: "ENTRADA",
      data: { gte: startDate, lte: endDate }
    }
  })

  const saidas = await db.transacao.aggregate({
    _sum: { valor: true },
    where: { 
      igreja_id: tenantId, 
      tipo: "SAIDA",
      data: { gte: startDate, lte: endDate }
    }
  })

  return {
    entradas: entradas._sum.valor || 0,
    saidas: saidas._sum.valor || 0,
    saldo: (entradas._sum.valor || 0) - (saidas._sum.valor || 0)
  }
}

export async function getCategoryTotals(ano: number) {
  const { db, tenantId } = await getTenantPrisma()
  const startDate = new Date(`${ano}-01-01T00:00:00.000Z`)
  const endDate = new Date(`${ano}-12-31T23:59:59.999Z`)

  const grouped = await db.transacao.groupBy({
    by: ["categoria_id"],
    _sum: { valor: true },
    where: {
      igreja_id: tenantId,
      categoria_id: { not: null },
      data: { gte: startDate, lte: endDate }
    }
  })

  const categoryIds = grouped.map((g) => g.categoria_id as string)
  const categories = await db.categoria.findMany({
    where: { id: { in: categoryIds } }
  })

  return grouped.map(g => {
    const cat = categories.find(c => c.id === g.categoria_id)
    return {
      category: cat ? cat.nome : "Desconhecida",
      total: g._sum.valor || 0
    }
  }).sort((a, b) => b.total - a.total)
}

export async function getMonthlyTotals(ano: number) {
  const { db, tenantId } = await getTenantPrisma()
  const promises = []

  for (let i = 0; i < 12; i++) {
    const mStart = new Date(ano, i, 1)
    const mEnd = new Date(ano, i + 1, 0, 23, 59, 59, 999)

    promises.push(
      db.transacao.aggregate({
        _sum: { valor: true },
        where: { igreja_id: tenantId, tipo: 'ENTRADA', data: { gte: mStart, lte: mEnd } }
      }),
      db.transacao.aggregate({
        _sum: { valor: true },
        where: { igreja_id: tenantId, tipo: 'SAIDA', data: { gte: mStart, lte: mEnd } }
      })
    )
  }

  const results = await Promise.all(promises)
  const monthlyTotals = []

  for (let i = 0; i < 12; i++) {
    monthlyTotals.push({
      entradas: results[i * 2]._sum.valor || 0,
      saidas: results[i * 2 + 1]._sum.valor || 0
    })
  }

  return monthlyTotals
}
