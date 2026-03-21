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

  // Comparison indicators — compare current month vs previous month from monthlyTotals
  const currentMonthIdx = now.getMonth()  // 0-based
  const prevMonthIdx = currentMonthIdx > 0 ? currentMonthIdx - 1 : null
  const currM = monthlyTotals[currentMonthIdx] ?? { entradas: 0, saidas: 0 }
  const prevM = prevMonthIdx !== null ? monthlyTotals[prevMonthIdx] : null

  const pctChange = (curr: number, prev: number | null): number | null => {
    if (prev === null || prev === 0) return null
    return ((curr - prev) / prev) * 100
  }

  const entradasPct  = pctChange(currM.entradas, prevM?.entradas ?? null)
  const saidasPct    = pctChange(currM.saidas,   prevM?.saidas   ?? null)
  const saldoCurrM   = currM.entradas - currM.saidas
  const saldoPrevM   = prevM ? prevM.entradas - prevM.saidas : null
  const saldoPct     = pctChange(saldoCurrM, saldoPrevM)

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-3">Dashboard</h1>
          <p className="text-xs opacity-70" style={{ margin: 'var(--space-1) 0 0 0' }}>Visão geral das finanças da igreja</p>
        </div>
        <div className="flex items-center gap-3">
          <DashboardFilter />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="card-body gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--text-secondary)]">Total Entradas</span>
              <span className="badge badge-soft badge-success text-xs">Entradas</span>
            </div>
            <p className="text-xl font-semibold" style={{ color: 'var(--success)', margin: 0 }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalEntradas)}
            </p>
            {entradasPct !== null && (
              <span className={`text-xs font-medium ${entradasPct >= 0 ? 'text-success' : 'text-error'}`}>
                {entradasPct >= 0 ? '↑' : '↓'} {entradasPct >= 0 ? '+' : ''}{entradasPct.toFixed(1)}% vs mês anterior
              </span>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-body gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--text-secondary)]">Total Saídas</span>
              <span className="badge badge-soft badge-error text-xs">Saídas</span>
            </div>
            <p className="text-xl font-semibold" style={{ color: 'var(--danger)', margin: 0 }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSaidas)}
            </p>
            {saidasPct !== null && (
              <span className={`text-xs font-medium ${saidasPct <= 0 ? 'text-success' : 'text-error'}`}>
                {saidasPct >= 0 ? '↑' : '↓'} {saidasPct >= 0 ? '+' : ''}{saidasPct.toFixed(1)}% vs mês anterior
              </span>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-body gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--text-secondary)]">Saldo Atual</span>
              <span className={`badge badge-soft text-xs ${saldo >= 0 ? 'badge-info' : 'badge-error'}`}>Saldo</span>
            </div>
            <p className="text-xl font-semibold" style={{ color: saldo >= 0 ? 'var(--success)' : 'var(--danger)', margin: 0 }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldo)}
            </p>
            {saldoPct !== null && (
              <span className={`text-xs font-medium ${saldoPct >= 0 ? 'text-success' : 'text-error'}`}>
                {saldoPct >= 0 ? '↑' : '↓'} {saldoPct >= 0 ? '+' : ''}{saldoPct.toFixed(1)}% vs mês anterior
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Financial Health Indicator */}
      {(() => {
        const expenseRatio = totalEntradas > 0 ? totalSaidas / totalEntradas : 1
        const health =
          saldo < 0
            ? { label: 'Saúde Financeira: Crítica', badge: 'badge-error', icon: '🔴' }
            : expenseRatio > 0.8
            ? { label: 'Saúde Financeira: Atenção', badge: 'badge-warning', icon: '🟡' }
            : { label: 'Saúde Financeira: Estável', badge: 'badge-success', icon: '🟢' }
        return (
          <div className="flex items-center gap-2">
            <span className={`badge badge-soft ${health.badge}`} style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-2)' }}>
              {health.icon} {health.label}
            </span>
            {totalEntradas > 0 && (
              <span className="text-xs" style={{ opacity: 0.6 }}>
                Despesas representam {(expenseRatio * 100).toFixed(0)}% das receitas
              </span>
            )}
          </div>
        )
      })()}

      {/* Dashboard Charts Interleaving Insights */}
      <DashboardCharts 
        evolutionData={evolutionData}
        pieEntradasData={pieEntradasData}
        pieSaidasData={pieSaidasData}
        barCultoData={barCultoData}
        insightsSlot={<FinancialInsights monthlyTotals={monthlyTotals} />}
      />
    </div>
  )
}
