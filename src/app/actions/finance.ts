'use server'

import { getTenantPrisma, checkPermission } from "@/lib/auth"
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
  await checkPermission('lancamentos.criar')

  await lancamentoService.criarLancamento({
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
  await checkPermission('lancamentos.editar')

  await lancamentoService.atualizarLancamento(id, {
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
  await checkPermission('lancamentos.excluir')

  await lancamentoService.deletarLancamento(id)

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
  const startDate = new Date(`${ano}-01-01T00:00:00.000Z`)
  const endDate = new Date(`${ano}-12-31T23:59:59.999Z`)

  return await lancamentoService.obterResumoFinanceiro(startDate, endDate)
}

export async function getIncomeByCategory(ano: number) {
  const startDate = new Date(`${ano}-01-01T00:00:00.000Z`)
  const endDate = new Date(`${ano}-12-31T23:59:59.999Z`)

  return await lancamentoService.listarEntradasPorCategoria(startDate, endDate)
}

export async function getExpensesByCategory(ano: number) {
  const startDate = new Date(`${ano}-01-01T00:00:00.000Z`)
  const endDate = new Date(`${ano}-12-31T23:59:59.999Z`)

  return await lancamentoService.listarSaidasPorCategoria(startDate, endDate)
}

export async function getIncomeByCulto(ano: number) {
  const startDate = new Date(`${ano}-01-01T00:00:00.000Z`)
  const endDate = new Date(`${ano}-12-31T23:59:59.999Z`)

  return await lancamentoService.listarEntradasPorCulto(startDate, endDate)
}

export async function getMonthlyTotals(ano: number) {
  return await lancamentoService.obterTotaisMensais(ano)
}

export async function getMonthlyEvolution() {
  return await lancamentoService.obterEvolucaoMensal()
}
