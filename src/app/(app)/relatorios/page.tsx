import { getTenantPrisma } from "@/lib/auth"
import { redirect } from "next/navigation"
import FinancialSummary from "@/components/reports/FinancialSummary"

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

  // Get all transactions for the year to build the table
  const transacoes = await db.transacao.findMany({
    where: { 
      igreja_id: tenantId,
      data: {
        gte: new Date(`${currentYear}-01-01`),
        lte: new Date(`${currentYear}-12-31`)
      }
    }
  })

  // Group by month
  const grouped = transacoes.reduce((acc: any, t: any) => {
    const month = t.data.getMonth() // 0-11
    if (!acc[month]) acc[month] = { entradas: 0, saidas: 0 }
    
    if (t.tipo === 'SAIDA') {
      acc[month].saidas += t.valor
    } else {
      acc[month].entradas += t.valor
    }
    return acc
  }, {} as Record<number, { entradas: number, saidas: number }>)

  const totalEntradas = transacoes
    .filter((t: any) => t.tipo === 'ENTRADA')
    .reduce((sum: number, t: any) => sum + t.valor, 0)
  
  const totalSaidas = transacoes
    .filter((t: any) => t.tipo === 'SAIDA')
    .reduce((sum: number, t: any) => sum + t.valor, 0)

  const saldoTotal = totalEntradas - totalSaidas

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

      <FinancialSummary entradas={totalEntradas} saidas={totalSaidas} saldo={saldoTotal} />

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Mês</th>
              <th style={{ textAlign: 'right', color: 'var(--success)' }}>Entradas</th>
              <th style={{ textAlign: 'right', color: 'var(--danger)' }}>Saídas</th>
              <th style={{ textAlign: 'right' }}>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m, idx) => {
              const data = grouped[idx] || { entradas: 0, saidas: 0 }
              const saldo = data.entradas - data.saidas
              return (
                <tr key={m}>
                  <td style={{ fontWeight: 500 }}>{m}</td>
                  <td style={{ textAlign: 'right' }}>R$ {data.entradas.toFixed(2).replace('.', ',')}</td>
                  <td style={{ textAlign: 'right' }}>R$ {data.saidas.toFixed(2).replace('.', ',')}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: saldo >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    R$ {saldo.toFixed(2).replace('.', ',')}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
