import { getTenantPrisma } from "@/lib/auth"
import { redirect } from "next/navigation"
import FinancialSummary from "@/components/reports/FinancialSummary"
import IncomeByCategory from "@/components/reports/IncomeByCategory"
import ExpensesByCategory from "@/components/reports/ExpensesByCategory"
import IncomeByCulto from "@/components/reports/IncomeByCulto"
import MonthlyEvolutionReport from "@/components/reports/MonthlyEvolutionReport"
import { getFinancialSummary, getIncomeByCategory, getExpensesByCategory, getIncomeByCulto, getMonthlyEvolution } from "@/app/actions/finance"

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

  const [summary, incomeByCategory, expensesByCategory, incomeByCulto, evolutionData] = await Promise.all([
    getFinancialSummary(currentYear),
    getIncomeByCategory(currentYear),
    getExpensesByCategory(currentYear),
    getIncomeByCulto(currentYear),
    getMonthlyEvolution()
  ])

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

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

      <FinancialSummary entradas={summary.entradas} saidas={summary.saidas} saldo={summary.saldo} />

      <IncomeByCategory data={incomeByCategory} />
      
      <IncomeByCulto data={incomeByCulto} />

      <ExpensesByCategory data={expensesByCategory} />

      <MonthlyEvolutionReport data={evolutionData} />
    </div>
  )
}
