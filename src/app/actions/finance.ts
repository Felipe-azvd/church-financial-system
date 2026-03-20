'use server'

import { getTenantPrisma } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import * as lancamentoService from "@/services/lancamentos.service"

export async function createTransaction(data: {
  descricao: string
  valor: number
  data: string
  tipo: string
  categoria_id?: string | null
  culto_id?: string | null
}) {
  const { tenantId, user } = await getTenantPrisma()

  if (!user.permissions.includes('lancamentos.criar')) {
    throw new Error('Acesso negado. Permissão necessária para criar lançamentos.')
  }

  await lancamentoService.criarLancamento(tenantId, user.id, {
    descricao: data.descricao,
    valor: data.valor,
    data: new Date(data.data),
    tipo: data.tipo,
    categoria_id: data.categoria_id || null,
    culto_id: data.culto_id || null
  })

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
  const { tenantId, user } = await getTenantPrisma()

  if (!user.permissions.includes('lancamentos.editar')) {
    throw new Error('Acesso negado. Permissão necessária para editar lançamentos.')
  }

  await lancamentoService.atualizarLancamento(tenantId, id, {
    descricao: data.descricao,
    valor: data.valor,
    data: new Date(data.data),
    tipo: data.tipo,
    categoria_id: data.categoria_id || null,
    culto_id: data.culto_id || null
  })

  revalidatePath('/lancamentos')
  revalidatePath('/dashboard')
}

export async function deleteTransaction(id: string) {
  const { tenantId, user } = await getTenantPrisma()

  if (!user.permissions.includes('lancamentos.excluir')) {
    throw new Error('Acesso negado. Permissão necessária para excluir lançamentos.')
  }

  await lancamentoService.deletarLancamento(tenantId, id)

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
  const { tenantId } = await getTenantPrisma()
  const startDate = new Date(`${ano}-01-01T00:00:00.000Z`)
  const endDate = new Date(`${ano}-12-31T23:59:59.999Z`)

  return await lancamentoService.obterResumoFinanceiro(tenantId, startDate, endDate)
}

export async function getIncomeByCategory(ano: number) {
  const { tenantId } = await getTenantPrisma()
  const startDate = new Date(`${ano}-01-01T00:00:00.000Z`)
  const endDate = new Date(`${ano}-12-31T23:59:59.999Z`)

  return await lancamentoService.listarEntradasPorCategoria(tenantId, startDate, endDate)
}

export async function getExpensesByCategory(ano: number) {
  const { tenantId } = await getTenantPrisma()
  const startDate = new Date(`${ano}-01-01T00:00:00.000Z`)
  const endDate = new Date(`${ano}-12-31T23:59:59.999Z`)

  return await lancamentoService.listarSaidasPorCategoria(tenantId, startDate, endDate)
}

export async function getIncomeByCulto(ano: number) {
  const { tenantId } = await getTenantPrisma()
  const startDate = new Date(`${ano}-01-01T00:00:00.000Z`)
  const endDate = new Date(`${ano}-12-31T23:59:59.999Z`)

  return await lancamentoService.listarEntradasPorCulto(tenantId, startDate, endDate)
}

export async function getMonthlyTotals(ano: number) {
  const { tenantId } = await getTenantPrisma()
  return await lancamentoService.obterTotaisMensais(tenantId, ano)
}

export async function getMonthlyEvolution() {
  const { tenantId } = await getTenantPrisma()
  return await lancamentoService.obterEvolucaoMensal(tenantId)
}
