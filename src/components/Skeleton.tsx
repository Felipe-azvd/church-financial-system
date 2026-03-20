// Reusable skeleton primitives using FlyonUI's animate-pulse pattern

export function SkeletonLine({ width = 'w-full', height = 'h-4' }: { width?: string; height?: string }) {
  return (
    <div className={`animate-pulse bg-base-300 rounded ${height} ${width}`} />
  )
}

export function SkeletonCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="card-body gap-4">{children}</div>
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <SkeletonCard>
      <div className="flex items-center justify-between">
        <SkeletonLine width="w-1/3" height="h-3" />
        <SkeletonLine width="w-16" height="h-5" />
      </div>
      <SkeletonLine width="w-2/3" height="h-8" />
    </SkeletonCard>
  )
}

export function SkeletonChartCard({ title }: { title: string }) {
  return (
    <div className="card">
      <div className="card-body" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <SkeletonLine width="w-40" height="h-5" />
      </div>
      <div className="card-body">
        <div className="animate-pulse" style={{ height: '320px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }} />
      </div>
    </div>
  )
}

export function SkeletonTableCard({ rows = 4 }: { rows?: number }) {
  return (
    <div className="card">
      <div className="card-body" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <SkeletonLine width="w-40" height="h-5" />
      </div>
      <div className="card-body">
        {/* Table header */}
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <SkeletonLine width="w-1/2" height="h-3" />
          <SkeletonLine width="w-1/4" height="h-3" />
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <SkeletonLine width="w-1/2" height="h-4" />
            <SkeletonLine width="w-1/4" height="h-4" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonInsightCard() {
  return (
    <div className="card">
      <div className="card-body" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <SkeletonLine width="w-40" height="h-5" />
      </div>
      <div className="card-body gap-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="card">
            <div className="card-body flex-row items-center gap-3">
              <div className="animate-pulse" style={{ width: 'var(--text-xl)', height: 'var(--text-xl)', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', flexShrink: 0 }} />
              <SkeletonLine width="w-3/4" height="h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
