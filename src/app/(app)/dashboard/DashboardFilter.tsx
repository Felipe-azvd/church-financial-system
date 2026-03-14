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

  return (
    <div className="card" style={{ marginBottom: 'var(--spacing-xl)', padding: 'var(--spacing-sm) var(--spacing-md)' }}>
      <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
          <label className="input-label" style={{ marginBottom: 0 }}>Período:</label>
          <select 
            className="input-field" 
            style={{ padding: '0.25rem 0.5rem', width: 'auto' }}
            value={currentFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="hoje">Hoje</option>
            <option value="7dias">Últimos 7 dias</option>
            <option value="30dias">Últimos 30 dias</option>
            <option value="mes">Este mês</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>

        {customRange && (
          <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
            <input type="date" name="inicio" defaultValue={inicio} required className="input-field" style={{ padding: '0.25rem 0.5rem', width: 'auto' }} />
            <span style={{ color: 'var(--text-secondary)' }}>até</span>
            <input type="date" name="fim" defaultValue={fim} required className="input-field" style={{ padding: '0.25rem 0.5rem', width: 'auto' }} />
            <button type="submit" className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Aplicar</button>
          </form>
        )}
      </div>
    </div>
  )
}
