'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function DashboardFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentFilter = searchParams.get('filter') || 'mes'
  const inicio = searchParams.get('inicio') || ''
  const fim = searchParams.get('fim') || ''

  const [customRange, setCustomRange] = useState(currentFilter === 'custom')

  useEffect(() => {
    setCustomRange(currentFilter === 'custom')
  }, [currentFilter])

  const handleFilterChange = (filter: string) => {
    if (filter === 'custom') {
      setCustomRange(true)
      return
    }
    
    setCustomRange(false)
    const params = new URLSearchParams()
    params.set('filter', filter)
    router.push(`/dashboard?${params.toString()}`)
  }

  const handleCustomSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const params = new URLSearchParams()
    params.set('filter', 'custom')
    if (formData.get('inicio')) params.set('inicio', formData.get('inicio') as string)
    if (formData.get('fim')) params.set('fim', formData.get('fim') as string)
    router.push(`/dashboard?${params.toString()}`)
  }

  if (!customRange) return null

  return (
    <div className="card w-full mb-8">
      <form onSubmit={handleCustomSubmit} className="card-body" style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', flexWrap: 'wrap', flexDirection: 'row' }}>
        <label className="input-label" style={{ marginBottom: 0 }}>De:</label>
        <input type="date" name="inicio" defaultValue={inicio} required className="input-field" style={{ padding: 'var(--space-1) var(--space-2)', width: 'auto' }} />
        <span style={{ color: 'var(--text-muted)' }}>até</span>
        <input type="date" name="fim" defaultValue={fim} required className="input-field" style={{ padding: 'var(--space-1) var(--space-2)', width: 'auto' }} />
        <button type="submit" className="btn btn-secondary" style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)' }}>Aplicar</button>
        <button type="button" className="btn btn-secondary" style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)' }} onClick={() => setCustomRange(false)}>Cancelar</button>
      </form>
    </div>
  )
}
