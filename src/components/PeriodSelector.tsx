'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const PERIOD_OPTIONS = [
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
  const [value, setValue] = useState(currentFilter)

  useEffect(() => {
    setValue(currentFilter)
  }, [currentFilter])

  const handleChange = (newValue: string) => {
    setValue(newValue)
    const params = new URLSearchParams(searchParams.toString())
    params.set('filter', newValue)
    router.push(`/dashboard?${params.toString()}`)
  }

  // Only render on dashboard
  if (!pathname.startsWith('/dashboard')) return null

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs opacity-70 whitespace-nowrap">Período:</label>
      <select
        className="select select-sm"
        style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)', minWidth: '130px' }}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
      >
        {PERIOD_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
