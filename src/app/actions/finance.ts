'use server'

import { registrarLog } from "@/lib/logger"
import { checkPermission, getTenantPrisma } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import * as lancamentoService from "@/services/lancamentos.service"
import { lancamentoSchema } from "@/schemas/lancamento.schema"
import { ActionResponse } from "@/types/actions"
import { z } from "zod"

export async function createTransaction(data: {
  descricao: string
  valor: number
  data: string
  tipo: string
  categoria_id?: string | null
  culto_id?: string | null
}): Promise<ActionResponse> {
  try {
    await checkPermission('lancamentos.criar')

    // Optional fields must be handled since schema is typed
    const parsedData = lancamentoSchema.parse({
      ...data,
      categoria_id: data.categoria_id || undefined,
      culto_id: data.culto_id || undefined
    })

    await lancamentoService.criarLancamento({
      descricao: parsedData.descricao,
      valor: parsedData.valor,
      data: new Date(parsedData.data),
      tipo: parsedData.tipo,
      categoria_id: parsedData.categoria_id,
      culto_id: parsedData.culto_id
    })
    await registrarLog("CRIAR_TRANSACAO", `Lançamento de R$ ${parsedData.valor} adicionado`, "Lancamento", null)

    revalidatePath('/lancamentos')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: (error as any).errors[0].message }
    }
    return { success: false, error: error.message || 'Erro interno ao criar transação' }
  }
}

export async function updateTransaction(id: string, data: {
  descricao: string
  valor: number
  data: string
  tipo: string
  categoria_id?: string | null
  culto_id?: string | null
}): Promise<ActionResponse> {
  try {
    await checkPermission('lancamentos.editar')

    const parsedData = lancamentoSchema.parse({
      ...data,
      categoria_id: data.categoria_id || undefined,
      culto_id: data.culto_id || undefined
    })

    await lancamentoService.atualizarLancamento(id, {
      descricao: parsedData.descricao,
      valor: parsedData.valor,
      data: new Date(parsedData.data),
      tipo: parsedData.tipo,
      categoria_id: parsedData.categoria_id,
      culto_id: parsedData.culto_id
    })
    await registrarLog("EDITAR_TRANSACAO", `Lançamento de R$ ${parsedData.valor} atualizado`, "Lancamento", id)

    revalidatePath('/lancamentos')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: (error as any).errors[0].message }
    }
    return { success: false, error: error.message || 'Erro interno ao atualizar transação' }
  }
}

export async function deleteTransaction(id: string): Promise<ActionResponse> {
  try {
    await checkPermission('lancamentos.excluir')

    await lancamentoService.deletarLancamento(id)
    await registrarLog("EXCLUIR_TRANSACAO", `Lançamento excluído`, "Lancamento", id)

    revalidatePath('/lancamentos')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro interno ao excluir transação' }
  }
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
