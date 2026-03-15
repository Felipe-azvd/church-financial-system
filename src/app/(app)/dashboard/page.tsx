import { getTenantPrisma } from "@/lib/auth"
import DashboardCharts from "./DashboardCharts"
import DashboardFilter from "./DashboardFilter"
import FinancialInsights from "@/components/dashboard/FinancialInsights"
import { getMonthlyTotals } from "@/app/actions/finance"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; inicio?: string; fim?: string }>
}) {
  const { db, tenantId } = await getTenantPrisma()
  const sp = await searchParams

  const now = new Date()
  let dataGte: Date | undefined
  let dataLte: Date | undefined

  const filter = sp.filter || 'mes'

  if (filter === 'hoje') {
    dataGte = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    dataLte = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  } else if (filter === '7dias') {
    dataGte = new Date()
    dataGte.setDate(now.getDate() - 7)
  } else if (filter === '30dias') {
    dataGte = new Date()
    dataGte.setDate(now.getDate() - 30)
  } else if (filter === 'mes') {
    dataGte = new Date(now.getFullYear(), now.getMonth(), 1)
    dataLte = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  } else if (filter === 'custom') {
    if (sp.inicio) dataGte = new Date(`${sp.inicio}T00:00:00.000`)
    if (sp.fim) dataLte = new Date(`${sp.fim}T23:59:59.999`)
  }

  const dataCondition = {
    ...(dataGte && { gte: dataGte }),
    ...(dataLte && { lte: dataLte })
  }

  const whereBase = {
    igreja_id: tenantId,
    ...(Object.keys(dataCondition).length > 0 && { data: dataCondition })
  }

  // Fetch all transactions within the period to generate detailed charts
  const transacoes = await db.transacao.findMany({
    where: whereBase,
    include: {
      categoria: true,
      culto: true
    },
    orderBy: { data: 'asc' }
  })

  let totalEntradas = 0
  let totalSaidas = 0

  // 1. Financial Evolution Data
  const evolutionMap: Record<string, { date: string, entradas: number, saidas: number }> = {}
  
  // 2. Categories Data
  const catEntradasMap: Record<string, number> = {}
  const catSaidasMap: Record<string, number> = {}

  // 3. Cultos Data
  const cultoEntradasMap: Record<string, number> = {}

  transacoes.forEach((t: any) => {
    // Totals
    if (t.tipo === 'ENTRADA') totalEntradas += t.valor
    if (t.tipo === 'SAIDA') totalSaidas += t.valor

    // Evolution
    // Use UTC date string to prevent timezone shifts matching the display
    const dateStr = t.data.toISOString().split('T')[0].split('-').slice(1).reverse().join('/') // DD/MM
    if (!evolutionMap[dateStr]) evolutionMap[dateStr] = { date: dateStr, entradas: 0, saidas: 0 }
    if (t.tipo === 'ENTRADA') evolutionMap[dateStr].entradas += t.valor
    if (t.tipo === 'SAIDA') evolutionMap[dateStr].saidas += t.valor

    // Categories
    const catName = t.categoria?.nome || 'Sem Categoria'
    if (t.tipo === 'ENTRADA') {
      catEntradasMap[catName] = (catEntradasMap[catName] || 0) + t.valor
    } else {
      catSaidasMap[catName] = (catSaidasMap[catName] || 0) + t.valor
    }

    // Cultos
    if (t.tipo === 'ENTRADA') {
      const cultoName = t.culto?.nome || 'Outros / Sem Culto'
      cultoEntradasMap[cultoName] = (cultoEntradasMap[cultoName] || 0) + t.valor
    }
  })

  const evolutionData = Object.values(evolutionMap)
  const pieEntradasData = Object.entries(catEntradasMap).map(([name, value]) => ({ name, value })).filter(d => d.value > 0).sort((a,b) => b.value - a.value)
  const pieSaidasData = Object.entries(catSaidasMap).map(([name, value]) => ({ name, value })).filter(d => d.value > 0).sort((a,b) => b.value - a.value)
  const barCultoData = Object.entries(cultoEntradasMap).map(([name, value]) => ({ name, value })).filter(d => d.value > 0).sort((a,b) => b.value - a.value)

  const saldo = totalEntradas - totalSaidas
  const currentYear = now.getFullYear()
  const monthlyTotals = await getMonthlyTotals(currentYear)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Visão geral das finanças da igreja</p>
        </div>
      </div>

      <DashboardFilter />

      <div className="stats-grid">
        <div className="card">
          <div className="card-body gap-2">
            <div className="flex items-center justify-between">
              <span className="stat-label">Total Entradas</span>
              <span className="badge badge-soft badge-success text-xs">Entradas</span>
            </div>
            <div className="stat-value success">
              R$ {totalEntradas.toFixed(2).replace('.', ',')}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body gap-2">
            <div className="flex items-center justify-between">
              <span className="stat-label">Total Saídas</span>
              <span className="badge badge-soft badge-error text-xs">Saídas</span>
            </div>
            <div className="stat-value danger">
              R$ {totalSaidas.toFixed(2).replace('.', ',')}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body gap-2">
            <div className="flex items-center justify-between">
              <span className="stat-label">Saldo Atual</span>
              <span className={`badge badge-soft text-xs ${saldo >= 0 ? 'badge-info' : 'badge-error'}`}>Saldo</span>
            </div>
            <div className={`stat-value ${saldo >= 0 ? 'success' : 'danger'}`}>
              R$ {saldo.toFixed(2).replace('.', ',')}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'var(--spacing-xl)' }}>
        <FinancialInsights monthlyTotals={monthlyTotals} />
      </div>

      <div style={{ marginTop: 'var(--spacing-xl)' }}>
        <DashboardCharts 
          evolutionData={evolutionData}
          pieEntradasData={pieEntradasData}
          pieSaidasData={pieSaidasData}
          barCultoData={barCultoData}
        />
      </div>
    </div>
  )
}
