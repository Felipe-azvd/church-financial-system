import { getTenantPrisma } from "@/lib/auth"
import { redirect } from "next/navigation"
import FinancialSummary from "@/components/reports/FinancialSummary"
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
  
  if (!user.permissions.includes('relatorios.visualizar')) {
    redirect('/dashboard')
  }

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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ margin: 0 }}>Relatórios</h1>
          <p className="text-sm" style={{ margin: 'var(--space-1) 0 0 0', opacity: 0.7 }}>Análise e resumo das finanças por período</p>
        </div>
        <div className="flex items-center gap-3">
          <form className="card" style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
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
      <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Resumo Financeiro
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-md)'
        }}>
          <div className="card" style={{ padding: 0 }}>
            <div className="card-body gap-2">
              <span className="card-title text-xs font-medium" style={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Entradas Totais</span>
              <p className="text-2xl font-bold" style={{ color: 'var(--success)', margin: 0 }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.entradas)}
              </p>
            </div>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="card-body gap-2">
              <span className="card-title text-xs font-medium" style={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saídas Totais</span>
              <p className="text-2xl font-bold" style={{ color: 'var(--danger)', margin: 0 }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.saidas)}
              </p>
            </div>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="card-body gap-2">
              <span className="card-title text-xs font-medium" style={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saldo Anual</span>
              <p className="text-2xl font-bold" style={{ color: summary.saldo >= 0 ? 'var(--success)' : 'var(--danger)', margin: 0 }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.saldo)}
              </p>
            </div>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="card-body gap-2">
              <span className="card-title text-xs font-medium" style={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Média Mensal</span>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)', margin: 0 }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mediaMensal)}
              </p>
            </div>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="card-body gap-2">
              <span className="card-title text-xs font-medium" style={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Melhor Mês</span>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)', margin: 0 }}>{melhorMes}</p>
            </div>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="card-body gap-2">
              <span className="card-title text-xs font-medium" style={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Maior Despesa</span>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)', margin: 0 }}>{maiorDespesa}</p>
            </div>
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
