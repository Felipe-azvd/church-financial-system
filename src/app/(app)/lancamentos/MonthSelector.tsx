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
    <div className="flex items-center gap-3">
      <button onClick={handlePrev} className="p-2 rounded-[var(--radius-field)] bg-[var(--color-base-200)] border border-[var(--color-base-300)] hover:bg-[var(--color-base-300)] transition-colors">
        <ChevronLeft size={20} />
      </button>
      <h2 className="min-w-[200px] text-center capitalize m-0 font-medium">
        {monthName}
      </h2>
      <button onClick={handleNext} className="p-2 rounded-[var(--radius-field)] bg-[var(--color-base-200)] border border-[var(--color-base-300)] hover:bg-[var(--color-base-300)] transition-colors">
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
