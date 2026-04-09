import { getTenantPrisma, checkPermission } from "@/lib/auth"
import FinancialSummary from "@/components/reports/FinancialSummary"
import { TrendingUp, TrendingDown, DollarSign, Calculator, CalendarPlus, CalendarMinus } from 'lucide-react'
import IncomeByCategory from "@/components/reports/IncomeByCategory"
import ExpensesByCategory from "@/components/reports/ExpensesByCategory"
import IncomeByCulto from "@/components/reports/IncomeByCulto"
import MonthlyEvolutionReport from "@/components/reports/MonthlyEvolutionReport"
import { getFinancialSummary, getIncomeByCategory, getExpensesByCategory, getIncomeByCulto, getMonthlyEvolution, getMonthlyTotals } from "@/app/actions/finance"

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
              /* Usamos classes diretas aqui para não herdar o padding da setinha do Select do Dashboard */
              className="bg-black/20 backdrop-blur-md border border-[rgba(255,255,255,0.15)] text-[var(--text-color)] rounded-lg text-center focus:border-[#3b82f6] outline-none transition-all m-0"
              style={{ height: '42px', width: '110px', fontSize: '0.95rem', padding: '0 0.5rem' }}
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
        <h2 className="text-lg font-semibold mb-0" style={{ color: 'var(--text-primary)' }}>
          Resumo Financeiro
        </h2>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          
          {/* Card: Entradas Totais */}
          <div className="metric-card metric-card-green p-6 group">
            <div className="flex flex-row items-center justify-between pb-4">
              <div className="uppercase">Entradas Totais</div>
              <div className="icon-box">
                <TrendingUp className="text-emerald-400 w-5 h-5" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-metric">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.entradas)}
              </div>
            </div>
            <div className="metric-blob"></div>
          </div>

          {/* Card: Saídas Totais */}
          <div className="metric-card metric-card-red p-6 group">
            <div className="flex flex-row items-center justify-between pb-4">
              <div className="uppercase">Saídas Totais</div>
              <div className="icon-box">
                <TrendingDown className="text-red-400 w-5 h-5" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-metric">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.saidas)}
              </div>
            </div>
            <div className="metric-blob"></div>
          </div>

          {/* Card: Saldo Anual */}
          <div className={`metric-card p-6 group ${summary.saldo >= 0 ? 'metric-card-green' : 'metric-card-red'}`}>
            <div className="flex flex-row items-center justify-between pb-4">
              <div className="uppercase">Saldo Anual</div>
              <div className="icon-box">
                <DollarSign className={summary.saldo >= 0 ? "text-emerald-400 w-5 h-5" : "text-red-400 w-5 h-5"} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-metric">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.saldo)}
              </div>
            </div>
            <div className="metric-blob"></div>
          </div>

          {/* Card: Média Mensal */}
          <div className="metric-card metric-card-blue p-6 group">
            <div className="flex flex-row items-center justify-between pb-4">
              <div className="uppercase">Média Mensal</div>
              <div className="icon-box">
                <Calculator className="text-blue-400 w-5 h-5" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-metric">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mediaMensal)}
              </div>
            </div>
            <div className="metric-blob"></div>
          </div>

          {/* Card: Melhor Mês */}
          <div className="metric-card metric-card-purple p-6 group">
            <div className="flex flex-row items-center justify-between pb-4">
              <div className="uppercase">Melhor Mês</div>
              <div className="icon-box">
                <CalendarPlus className="text-emerald-400 w-5 h-5" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-metric">
                {melhorMes}
              </div>
            </div>
            <div className="metric-blob"></div>
          </div>

          {/* Card: Maior Despesa */}
          <div className="metric-card metric-card-orange p-6 group">
            <div className="flex flex-row items-center justify-between pb-4">
              <div className="uppercase">Maior Despesa</div>
              <div className="icon-box">
                <CalendarMinus className="text-orange-400 w-5 h-5" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-metric">
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
