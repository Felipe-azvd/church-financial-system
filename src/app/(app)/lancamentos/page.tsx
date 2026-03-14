import { getLookups } from "@/app/actions/finance"
import { getTenantPrisma } from "@/lib/auth"
import { redirect } from "next/navigation"
import LaunchContainer from "./LaunchContainer"
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

  const transacoes = await db.transacao.findMany({
    where: { 
      igreja_id: tenantId,
      data: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    },
    orderBy: { data: 'asc' },
    include: {
      categoria: true,
      culto: true,
    }
  })

  // Split transactions
  const entradas = transacoes.filter((t: any) => t.tipo === 'ENTRADA')
  const saidas = transacoes.filter((t: any) => t.tipo === 'SAIDA')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
        <h1 style={{ margin: 0 }}>Lançamentos</h1>
        <MonthSelector />
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
