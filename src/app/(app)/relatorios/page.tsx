import { getTenantPrisma, checkPermission } from "@/lib/auth"
import FinancialSummary from "@/components/reports/FinancialSummary"
import { TrendingUp, TrendingDown, DollarSign, Calculator, CalendarPlus, CalendarMinus } from 'lucide-react'
import IncomeByCategory from "@/components/reports/IncomeByCategory"
import ExpensesByCategory from "@/components/reports/ExpensesByCategory"
import IncomeByCulto from "@/components/reports/IncomeByCulto"
import MonthlyEvolutionReport from "@/components/reports/MonthlyEvolutionReport"
import { getFinancialSummary, getIncomeByCategory, getExpensesByCategory, getIncomeByCulto, getMonthlyEvolution, getMonthlyTotals } from "@/app/actions/finance"

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: { ano?: string }
}) {
  const { db, tenantId, user } = await getTenantPrisma()
  
  await checkPermission('relatorios.visualizar')

  const currentYear = searchParams.ano ? parseInt(searchParams.ano) : new Date().getFullYear()

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
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-3">Relatórios</h1>
          <p className="text-xs opacity-70" style={{ margin: 'var(--space-1) 0 0 0' }}>Análise e resumo das finanças por período</p>
        </div>
        <div className="flex items-center gap-3">
          <form className="card w-full" style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
            <label className="input-label">Ano:</label>
            <input 
              type="number" 
              name="ano" 
              defaultValue={currentYear} 
              className="input-field" 
              style={{ padding: 'var(--space-1)', width: '80px' }} 
            />
            <button type="submit" className="btn btn-secondary" style={{ padding: 'var(--space-1) var(--space-2)' }}>Ver</button>
          </form>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Resumo Financeiro
        </h2>
<div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          
          {/* Card: Entradas Totais */}
          <div className="metric-card metric-card-green p-6 group">
            <div className="flex flex-row items-center justify-between pb-4">
              <div className="font-medium text-[var(--text-muted)] text-xs tracking-wider uppercase">Entradas Totais</div>
              <div className="icon-box">
                <TrendingUp className="text-emerald-400 w-5 h-5" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-metric" style={{ color: 'var(--success)' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.entradas)}
              </div>
            </div>
            <div className="metric-blob"></div>
          </div>

          {/* Card: Saídas Totais */}
          <div className="metric-card metric-card-red p-6 group">
            <div className="flex flex-row items-center justify-between pb-4">
              <div className="font-medium text-[var(--text-muted)] text-xs tracking-wider uppercase">Saídas Totais</div>
              <div className="icon-box">
                <TrendingDown className="text-red-400 w-5 h-5" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-metric" style={{ color: 'var(--danger)' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.saidas)}
              </div>
            </div>
            <div className="metric-blob"></div>
          </div>

          {/* Card: Saldo Anual */}
          <div className={`metric-card p-6 group ${summary.saldo >= 0 ? 'metric-card-green' : 'metric-card-red'}`}>
            <div className="flex flex-row items-center justify-between pb-4">
              <div className="font-medium text-[var(--text-muted)] text-xs tracking-wider uppercase">Saldo Anual</div>
              <div className="icon-box">
                <DollarSign className={summary.saldo >= 0 ? "text-emerald-400 w-5 h-5" : "text-red-400 w-5 h-5"} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-metric" style={{ color: summary.saldo >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.saldo)}
              </div>
            </div>
            <div className="metric-blob"></div>
          </div>

          {/* Card: Média Mensal */}
          <div className="metric-card metric-card-blue p-6 group">
            <div className="flex flex-row items-center justify-between pb-4">
              <div className="font-medium text-[var(--text-muted)] text-xs tracking-wider uppercase">Média Mensal</div>
              <div className="icon-box">
                <Calculator className="text-blue-400 w-5 h-5" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-metric" style={{ color: 'var(--text-primary)' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mediaMensal)}
              </div>
            </div>
            <div className="metric-blob"></div>
          </div>

          {/* Card: Melhor Mês */}
          <div className="metric-card metric-card-purple p-6 group">
            <div className="flex flex-row items-center justify-between pb-4">
              <div className="font-medium text-[var(--text-muted)] text-xs tracking-wider uppercase">Melhor Mês</div>
              <div className="icon-box">
                <CalendarPlus className="text-emerald-400 w-5 h-5" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-metric text-2xl sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
                {melhorMes}
              </div>
            </div>
            <div className="metric-blob"></div>
          </div>

          {/* Card: Maior Despesa */}
          <div className="metric-card metric-card-orange p-6 group">
            <div className="flex flex-row items-center justify-between pb-4">
              <div className="font-medium text-[var(--text-muted)] text-xs tracking-wider uppercase">Maior Despesa</div>
              <div className="icon-box">
                <CalendarMinus className="text-orange-400 w-5 h-5" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-metric text-2xl sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
                {maiorDespesa}
              </div>
            </div>
            <div className="metric-blob"></div>
          </div>

        </div>
      </div>

      <IncomeByCategory data={incomeByCategory} />
      
      <IncomeByCulto data={incomeByCulto} />

      <ExpensesByCategory data={expensesByCategory} />

      <MonthlyEvolutionReport data={evolutionData} />
    </div>
  )
}
