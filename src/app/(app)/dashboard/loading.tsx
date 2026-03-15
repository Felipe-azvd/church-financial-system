import {
  SkeletonStatCard,
  SkeletonChartCard,
  SkeletonInsightCard,
  SkeletonLine
} from '@/components/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Page Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <SkeletonLine width="w-32" height="h-6" />
          <SkeletonLine width="w-56" height="h-3" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      {/* Insights */}
      <SkeletonInsightCard />

      {/* Charts */}
      <SkeletonChartCard title="Evolução Financeira" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--spacing-xl)' }}>
        <SkeletonChartCard title="Entradas por Categoria" />
        <SkeletonChartCard title="Despesas por Categoria" />
      </div>

      <SkeletonChartCard title="Entradas por Culto" />
    </div>
  )
}
