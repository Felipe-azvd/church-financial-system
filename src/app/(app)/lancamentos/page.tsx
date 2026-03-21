import { getLookups } from "@/app/actions/finance"
import { getTenantPrisma } from "@/lib/auth"
import { redirect } from "next/navigation"
import { listarLancamentos } from "@/services/lancamentos.service"
import MonthSelector from "./MonthSelector"
import TransactionList from "./TransactionList"

export default async function LancamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>
}) {
  const { db, tenantId, user } = await getTenantPrisma()
  
  if (!user.permissions.includes('lancamentos.visualizar')) {
    redirect('/dashboard')
  }

  const lookups = await getLookups()
  const sp = await searchParams
  
  const currentMonthStr = sp.mes
  const currentDate = currentMonthStr ? new Date(`${currentMonthStr}-01T12:00:00`) : new Date()
  
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  const startOfMonth = new Date(currentYear, currentMonth, 1)
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999)

  const transacoes = await listarLancamentos(startOfMonth, endOfMonth)

  // Split transactions
  const entradas = transacoes.filter((t: any) => t.tipo === 'ENTRADA')
  const saidas = transacoes.filter((t: any) => t.tipo === 'SAIDA')

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-3">Lançamentos</h1>
          <p className="text-xs opacity-70" style={{ margin: 'var(--space-1) 0 0 0' }}>Registro e acompanhamento de transações financeiras</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthSelector />
        </div>
      </div>

      <TransactionList 
        entradas={entradas} 
        saidas={saidas} 
        lookups={lookups}
        userPermissions={user.permissions} 
      />
    </div>
  )
}
