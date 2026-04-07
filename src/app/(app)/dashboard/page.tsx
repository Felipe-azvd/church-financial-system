import { getTenantPrisma } from "@/lib/auth"
import DashboardCharts from "./DashboardCharts"
import DashboardFilter from "./DashboardFilter"
import FinancialInsights from "@/components/dashboard/FinancialInsights"
import { getMonthlyTotals } from "@/app/actions/finance"
import PeriodSelector from "@/components/PeriodSelector"
import { Suspense } from "react"
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

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
  const pieEntradasData = Object.entries(catEntradasMap).map(([name, value]) => ({ name, value })).filter(d => d.value > 0).sort((a, b) => b.value - a.value)
  const pieSaidasData = Object.entries(catSaidasMap).map(([name, value]) => ({ name, value })).filter(d => d.value > 0).sort((a, b) => b.value - a.value)
  const barCultoData = Object.entries(cultoEntradasMap).map(([name, value]) => ({ name, value })).filter(d => d.value > 0).sort((a, b) => b.value - a.value)

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

  const entradasPct = pctChange(currM.entradas, prevM?.entradas ?? null)
  const saidasPct = pctChange(currM.saidas, prevM?.saidas ?? null)
  const saldoCurrM = currM.entradas - currM.saidas
  const saldoPrevM = prevM ? prevM.entradas - prevM.saidas : null
  const saldoPct = pctChange(saldoCurrM, saldoPrevM)

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-3">Dashboard</h1>
          <p className="text-xs opacity-70">Visão geral das finanças da igreja</p>
        </div>
        <div className="flex items-center gap-3">
          <Suspense fallback={null}>
            <PeriodSelector />
          </Suspense>
          <DashboardFilter />
        </div>
      </div>

      {/* Key Metrics Premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Card: Entradas */}
        <div className="metric-card metric-card-green p-6 group">
          <div className="flex flex-row items-center justify-between pb-4">
            <div className="uppercase">Total Entradas</div>
            <div className="icon-box">
              <TrendingUp className="text-emerald-400 w-5 h-5" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-metric text-[var(--success)]">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalEntradas)}
            </div>
            {entradasPct !== null ? (
              <div className={`flex items-center font-medium rounded-full border px-2 py-1 text-xs ${entradasPct >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                {entradasPct >= 0 ? '↑' : '↓'} {Math.abs(entradasPct).toFixed(1)}%
              </div>
            ) : (
              <div className="text-xs font-medium opacity-50">Sem dados</div>
            )}
          </div>
          <div className="metric-blob"></div>
        </div>

        {/* Card: Saídas */}
        <div className="metric-card metric-card-red p-6 group">
          <div className="flex flex-row items-center justify-between pb-4">
            <div className="uppercase">Total Saídas</div>
            <div className="icon-box">
              <TrendingDown className="text-red-400 w-5 h-5" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-metric text-[var(--danger)]">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSaidas)}
            </div>
            {saidasPct !== null ? (
              <div className={`flex items-center font-medium rounded-full border px-2 py-1 text-xs ${saidasPct <= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                {saidasPct >= 0 ? '↑' : '↓'} {Math.abs(saidasPct).toFixed(1)}%
              </div>
            ) : (
              <div className="text-xs font-medium opacity-50">Sem dados</div>
            )}
          </div>
          <div className="metric-blob"></div>
        </div>

        {/* Card: Saldo */}
        <div className={`metric-card p-6 group ${saldo >= 0 ? 'metric-card-green' : 'metric-card-red'}`}>
          <div className="flex flex-row items-center justify-between pb-4">
            <div className="uppercase">Saldo Atual</div>
            <div className="icon-box">
              <DollarSign className="text-blue-400 w-5 h-5" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div className={`text-metric ${saldo >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldo)}
            </div>
            {saldoPct !== null ? (
              <div className={`flex items-center font-medium rounded-full border px-2 py-1 text-xs ${saldoPct >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                {saldoPct >= 0 ? '↑' : '↓'} {Math.abs(saldoPct).toFixed(1)}%
              </div>
            ) : (
              <div className="text-xs font-medium opacity-50">Sem dados</div>
            )}
          </div>
          <div className="metric-blob"></div>
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
          <div className="flex items-center gap-2 mt-2">
            <span className={`badge badge-soft ${health.badge}`} style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-2)' }}>
              {health.icon} {health.label}
            </span>
            {totalEntradas > 0 && (
              <span className="text-xs opacity-60">
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