import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'

type StatCardTone = 'success' | 'danger' | 'neutral' | 'brass'

type StatCardProps = {
  label: string
  value: string
  icon: LucideIcon
  tone?: StatCardTone
  trend?: { value: number; direction: 'up' | 'down'; tone?: 'success' | 'danger' }
}

const TONE_STYLE: Record<StatCardTone, { border: string; iconBg: string; iconColor: string }> = {
  success: { border: 'border-l-[var(--color-success)]', iconBg: 'bg-[var(--color-success)]/10', iconColor: 'text-[var(--color-success)]' },
  danger: { border: 'border-l-[var(--color-error)]', iconBg: 'bg-[var(--color-error)]/10', iconColor: 'text-[var(--color-error)]' },
  neutral: { border: 'border-l-[var(--color-primary)]', iconBg: 'bg-[var(--color-primary)]/10', iconColor: 'text-[var(--color-primary)]' },
  brass: { border: 'border-l-[var(--color-accent)]', iconBg: 'bg-[var(--color-accent)]/10', iconColor: 'text-[var(--color-accent)]' },
}

export function StatCard({ label, value, icon: Icon, tone = 'neutral', trend }: StatCardProps) {
  const style = TONE_STYLE[tone]
  const trendTone = trend?.tone ?? (trend?.direction === 'up' ? 'success' : 'danger')
  const TrendIcon = trend?.direction === 'up' ? TrendingUp : TrendingDown

  return (
    <div className={`metric-card ${style.border} border-l-[3px] p-5 flex items-start justify-between gap-4`}>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)] truncate">{label}</p>
        <p className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight mt-2">{value}</p>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
              trendTone === 'success' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-error)]/10 text-[var(--color-error)]'
            }`}
          >
            <TrendIcon className="w-3 h-3" />
            {Math.abs(trend.value).toFixed(1)}%
          </span>
        )}
      </div>
      <div className={`w-10 h-10 rounded-[var(--radius-field)] flex items-center justify-center flex-shrink-0 ${style.iconBg} ${style.iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  )
}
