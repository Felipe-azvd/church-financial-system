'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function MonthSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentMonthStr = searchParams.get('mes')
  const currentDate = currentMonthStr ? new Date(`${currentMonthStr}-01T12:00:00`) : new Date()
  
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  const handlePrev = () => {
    const prev = new Date(currentYear, currentMonth - 1, 1)
    updateUrl(prev)
  }

  const handleNext = () => {
    const next = new Date(currentYear, currentMonth + 1, 1)
    updateUrl(next)
  }

  const updateUrl = (date: Date) => {
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const yyyy = date.getFullYear()
    const params = new URLSearchParams()
    params.set('mes', `${yyyy}-${mm}`)
    router.push(`/lancamentos?${params.toString()}`)
  }

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
      <button onClick={handlePrev} className="icon-btn" style={{ padding: 'var(--space-2)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
        <ChevronLeft size={20} />
      </button>
      <h2 style={{ minWidth: '200px', textAlign: 'center', textTransform: 'capitalize', margin: 0 }}>
        {monthName}
      </h2>
      <button onClick={handleNext} className="icon-btn" style={{ padding: 'var(--space-2)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
