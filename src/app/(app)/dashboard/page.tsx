import { getTenantPrisma } from "@/lib/auth"
import DashboardCharts from "./DashboardCharts"
import DashboardFilter from "./DashboardFilter"
import FinancialInsights from "@/components/dashboard/FinancialInsights"
import { getMonthlyTotals } from "@/app/actions/finance"
import PeriodSelector from "@/components/PeriodSelector"
import { Suspense } from "react"
import { TrendingUp, TrendingDown, DollarSign, AlertOctagon, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { StatCard } from "@/components/ui/StatCard"

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

  const evolutionMap: Record<string, { date: string, entradas: number, saidas: number }> = {}
  const catEntradasMap: Record<string, number> = {}
  const catSaidasMap: Record<string, number> = {}
  const cultoEntradasMap: Record<string, number> = {}

  transacoes.forEach((t: any) => {
    if (t.tipo === 'ENTRADA') totalEntradas += t.valor
    if (t.tipo === 'SAIDA') totalSaidas += t.valor

    const dateStr = t.data.toISOString().split('T')[0].split('-').slice(1).reverse().join('/')
    if (!evolutionMap[dateStr]) evolutionMap[dateStr] = { date: dateStr, entradas: 0, saidas: 0 }
    if (t.tipo === 'ENTRADA') evolutionMap[dateStr].entradas += t.valor
    if (t.tipo === 'SAIDA') evolutionMap[dateStr].saidas += t.valor

    const catName = t.categoria?.nome || 'Sem Categoria'
    if (t.tipo === 'ENTRADA') {
      catEntradasMap[catName] = (catEntradasMap[catName] || 0) + t.valor
    } else {
      catSaidasMap[catName] = (catSaidasMap[catName] || 0) + t.valor
    }

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

  const currentMonthIdx = now.getMonth()
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
    <div className="flex flex-col gap-6 w-full overflow-hidden">
      {/* Page Header Responsivo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
          <p className="text-xs opacity-70">Visão geral das finanças da igreja</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <Suspense fallback={null}>
            <PeriodSelector />
          </Suspense>
          <DashboardFilter />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 w-full">
        <StatCard
          label="Total Entradas"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalEntradas)}
          icon={TrendingUp}
          tone="success"
          trend={entradasPct !== null ? { value: entradasPct, direction: entradasPct >= 0 ? 'up' : 'down' } : undefined}
        />
        <StatCard
          label="Total Saídas"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSaidas)}
          icon={TrendingDown}
          tone="danger"
          trend={saidasPct !== null ? { value: saidasPct, direction: saidasPct >= 0 ? 'up' : 'down', tone: saidasPct <= 0 ? 'success' : 'danger' } : undefined}
        />
        <div className="sm:col-span-2 xl:col-span-1">
          <StatCard
            label="Saldo Atual"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldo)}
            icon={DollarSign}
            tone={saldo >= 0 ? 'success' : 'danger'}
            trend={saldoPct !== null ? { value: saldoPct, direction: saldoPct >= 0 ? 'up' : 'down' } : undefined}
          />
        </div>
      </div>

      {/* Financial Health Indicator */}
      {(() => {
        const expenseRatio = totalEntradas > 0 ? totalSaidas / totalEntradas : 1
        const health =
          saldo < 0
            ? { label: 'Crítica', className: 'bg-[var(--color-error)]/10 text-[var(--color-error)]', icon: AlertOctagon }
            : expenseRatio > 0.8
              ? { label: 'Atenção', className: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]', icon: AlertTriangle }
              : { label: 'Estável', className: 'bg-[var(--color-success)]/10 text-[var(--color-success)]', icon: CheckCircle2 }
        const HealthIcon = health.icon
        return (
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${health.className}`}>
              <HealthIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Saúde Financeira:</span> {health.label}
            </span>
            {totalEntradas > 0 && (
              <span className="text-xs text-[var(--text-muted)]">
                Despesas são {(expenseRatio * 100).toFixed(0)}% das receitas
              </span>
            )}
          </div>
        )
      })()}

      {/* Dashboard Charts Interleaving Insights - A magia da responsividade dos gráficos está dentro do componente DashboardCharts */}
      <div className="w-full overflow-hidden">
        <DashboardCharts
          evolutionData={evolutionData}
          pieEntradasData={pieEntradasData}
          pieSaidasData={pieSaidasData}
          barCultoData={barCultoData}
          insightsSlot={<FinancialInsights monthlyTotals={monthlyTotals} />}
        />
      </div>
    </div>
  )
}