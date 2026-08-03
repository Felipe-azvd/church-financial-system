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
        <div className="flex flex-col gap-2">
          <SkeletonLine width="w-32" height="h-6" />
          <SkeletonLine width="w-64" height="h-3" />
        </div>
        <div className="card px-4 py-2">
          <SkeletonLine width="w-28" height="h-8" />
        </div>
      </div>

      {/* Executive Summary Cards */}
      <div>
        <SkeletonLine width="w-48" height="h-5" />
        <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
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
