'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Select, type SelectOption } from '@/components/ui/Select'

const PERIOD_OPTIONS: SelectOption[] = [
  { value: 'mes',    label: 'Este mês' },
  { value: '7dias',  label: 'Últimos 7 dias' },
  { value: '30dias', label: 'Últimos 30 dias' },
  { value: 'custom', label: 'Personalizado' },
]

export default function PeriodSelector() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentFilter = searchParams.get('filter') || 'mes'

  if (!pathname.startsWith('/dashboard')) return null

  const handleChange = (newValue: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('filter', newValue)
    router.push(`/dashboard?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-[var(--text-muted)] whitespace-nowrap">
        Período:
      </label>
      <div className="w-44">
        <Select
          value={currentFilter}
          onChange={handleChange}
          options={PERIOD_OPTIONS}
          aria-label="Período"
        />
      </div>
    </div>
  )
}
