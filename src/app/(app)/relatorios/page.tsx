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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h1>Relatórios</h1>
        
        <form className="card" style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
          <label className="input-label">Ano:</label>
          <input 
            type="number" 
            name="ano" 
            defaultValue={currentYear} 
            className="input-field" 
            style={{ padding: '0.25rem' }} 
          />
          <button type="submit" className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>Ver</button>
        </form>
      </div>

      <FinancialSummary 
        ano={currentYear}
        entradas={summary.entradas} 
        saidas={summary.saidas} 
        saldo={summary.saldo} 
        melhorMes={melhorMes}
        maiorDespesa={maiorDespesa}
        mediaMensal={mediaMensal}
      />

      <IncomeByCategory data={incomeByCategory} />
      
      <IncomeByCulto data={incomeByCulto} />

      <ExpensesByCategory data={expensesByCategory} />

      <MonthlyEvolutionReport data={evolutionData} />
    </div>
  )
}
