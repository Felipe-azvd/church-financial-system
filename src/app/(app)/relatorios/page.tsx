import { getTenantPrisma, checkPermission } from "@/lib/auth"
import { TrendingUp, TrendingDown, DollarSign, Calculator, CalendarPlus, CalendarMinus } from 'lucide-react'
import IncomeByCategory from "@/components/reports/IncomeByCategory"
import ExpensesByCategory from "@/components/reports/ExpensesByCategory"
import IncomeByCulto from "@/components/reports/IncomeByCulto"
import MonthlyEvolutionReport from "@/components/reports/MonthlyEvolutionReport"
import { getFinancialSummary, getIncomeByCategory, getExpensesByCategory, getIncomeByCulto, getMonthlyEvolution, getMonthlyTotals } from "@/app/actions/finance"
import { StatCard } from "@/components/ui/StatCard"

export default async function RelatoriosPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ ano?: string }> 
}) {
  const { db, tenantId, user } = await getTenantPrisma()
  
  await checkPermission('relatorios.visualizar')

  const sp = await searchParams;
  const currentYear = sp.ano ? parseInt(sp.ano) : new Date().getFullYear();

  const [summary, incomeByCategory, expensesByCategory, incomeByCulto, evolutionData, monthlyTotals] = await Promise.all([
    getFinancialSummary(currentYear),
    getIncomeByCategory(currentYear),
    getExpensesByCategory(currentYear),
    getIncomeByCulto(currentYear),
    getMonthlyEvolution(),
    getMonthlyTotals(currentYear)
  ])

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  let bestRevenueMonthIdx = 0
  let maxRevenue = -1
  let worstExpenseMonthIdx = 0
  let maxExpense = -1

  monthlyTotals.forEach((m, idx) => {
    if (m.entradas > maxRevenue) {
      maxRevenue = m.entradas
      bestRevenueMonthIdx = idx
    }
    if (m.saidas > maxExpense) {
      maxExpense = m.saidas
      worstExpenseMonthIdx = idx
    }
  })

  // Avoid saying January is best month if all months are 0
  const melhorMes = maxRevenue > 0 ? months[bestRevenueMonthIdx] : '-'
  const maiorDespesa = maxExpense > 0 ? months[worstExpenseMonthIdx] : '-'
  const mediaMensal = summary.entradas / 12

  return (
    <div className="px-6 py-6 lg:px-10 flex flex-col gap-6">
      
      {/* Page Header & Filter Form Premium */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Relatórios</h1>
          <p className="text-xs text-[var(--text-muted)]">Análise e resumo das finanças por período</p>
        </div>
        
        <div className="flex items-center">
          <form className="flex items-center gap-3 m-0">
            <label htmlFor="ano" className="text-[0.95rem] font-medium text-[var(--text-muted)]">
              Ano:
            </label>
            <input
              type="number"
              name="ano"
              id="ano"
              defaultValue={currentYear}
              className="input-field text-center w-[110px]"
            />
            <button 
              type="submit" 
              className="btn-primary flex-shrink-0 !rounded-lg"
              style={{ minWidth: '100px', padding: '0 1.5rem' }}
            >
              Ver
            </button>
          </form>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold mb-0">Resumo Financeiro</h2>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          <StatCard label="Entradas Totais" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.entradas)} icon={TrendingUp} tone="success" />
          <StatCard label="Saídas Totais" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.saidas)} icon={TrendingDown} tone="danger" />
          <StatCard label="Saldo Anual" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.saldo)} icon={DollarSign} tone={summary.saldo >= 0 ? 'success' : 'danger'} />
          <StatCard label="Média Mensal" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mediaMensal)} icon={Calculator} tone="neutral" />
          <StatCard label="Melhor Mês" value={melhorMes} icon={CalendarPlus} tone="success" />
          <StatCard label="Maior Despesa" value={maiorDespesa} icon={CalendarMinus} tone="brass" />
        </div>
      </div>

      <IncomeByCategory data={incomeByCategory} />
      
      <IncomeByCulto data={incomeByCulto} />

      <ExpensesByCategory data={expensesByCategory} />

      <MonthlyEvolutionReport data={evolutionData} />
    </div>
  )
}
