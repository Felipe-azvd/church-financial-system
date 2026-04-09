import { getLookups } from "@/app/actions/finance"
import { getTenantPrisma, checkPermission } from "@/lib/auth"
import { listarLancamentos } from "@/services/lancamentos.service"
import MonthSelector from "./MonthSelector"
import TransactionList from "./TransactionList"

export default async function LancamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>
}) {
  const { db, tenantId, user } = await getTenantPrisma()
  await checkPermission('lancamentos.visualizar')

  const lookups = await getLookups()
  const sp = await searchParams
  
  const currentMonthStr = sp.mes
  const currentDate = currentMonthStr ? new Date(`${currentMonthStr}-01T12:00:00`) : new Date()
  
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  const startOfMonth = new Date(currentYear, currentMonth, 1)
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999)

  const transacoes = await listarLancamentos(startOfMonth, endOfMonth)

  const entradas = transacoes.filter((t: any) => t.tipo === 'ENTRADA')
  const saidas = transacoes.filter((t: any) => t.tipo === 'SAIDA')

  return (
    // Removidos os paddings fixos que conflitavam com o layout principal
    <div className="flex flex-col gap-6 w-full">
      <TransactionList 
        entradas={entradas} 
        saidas={saidas} 
        lookups={lookups}
        userPermissions={user.permissions} 
        isMaster={(user as any).is_master}
        headerSlot={<MonthSelector />}
      />
    </div>
  )
}