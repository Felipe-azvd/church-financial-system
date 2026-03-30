import {
  SkeletonStatCard,
  SkeletonTableCard,
  SkeletonLine
} from '@/components/Skeleton'

export default function RelatoriosLoading() {
  return (
    <div className="space-y-8">
      {/* Page Header skeleton */}
      <div className="flex items-center justify-between">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <SkeletonLine width="w-32" height="h-6" />
          <SkeletonLine width="w-64" height="h-3" />
        </div>
        <div className="card" style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>
          <SkeletonLine width="w-28" height="h-8" />
        </div>
      </div>

      {/* Executive Summary Cards */}
      <div>
        <SkeletonLine width="w-48" height="h-5" />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-md)',
          marginTop: 'var(--spacing-md)'
        }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
      </div>

      {/* Report Tables */}
      <SkeletonTableCard rows={4} />
      <SkeletonTableCard rows={3} />
      <SkeletonTableCard rows={4} />
      <SkeletonTableCard rows={12} />
    </div>
  )
}
