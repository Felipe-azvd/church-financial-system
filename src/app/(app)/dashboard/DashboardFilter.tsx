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

  const handleCustomSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const params = new URLSearchParams(searchParams)
    params.set('filter', 'custom')
    if (formData.get('inicio')) params.set('inicio', formData.get('inicio') as string)
    if (formData.get('fim')) params.set('fim', formData.get('fim') as string)
    router.push(`/dashboard?${params.toString()}`)
  }

  const handleCancel = () => {
    setCustomRange(false)
    const params = new URLSearchParams(searchParams)
    params.set('filter', 'mes') // Retorna para a visão mensal padrão
    params.delete('inicio')
    params.delete('fim')
    router.push(`/dashboard?${params.toString()}`)
  }

  if (!customRange) return null

  return (
    <form 
      onSubmit={handleCustomSubmit} 
      className="flex flex-wrap items-center gap-3 ml-0 sm:ml-3 animate-in fade-in slide-in-from-right-4 duration-300"
    >
      {/* Campo Data Inicial */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[var(--text-muted)]">De:</span>
        <input 
          type="date" 
          name="inicio"
          defaultValue={inicio} 
          required 
          className="bg-black/20 border border-[var(--border-tint)] rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-[#10b981] transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:invert" 
        />
      </div>

      {/* Campo Data Final */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[var(--text-muted)]">Até:</span>
        <input 
          type="date" 
          name="fim"
          defaultValue={fim} 
          required 
          className="bg-black/20 border border-[var(--border-tint)] rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-[#10b981] transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:invert" 
        />
      </div>

      {/* Botões */}
      <div className="flex items-center gap-2 ml-1">
        <button 
          type="button"
          onClick={handleCancel}
          className="bg-transparent border border-white/10 text-[var(--text-muted)] hover:bg-white/5 hover:text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
        >
          Cancelar
        </button>
        <button 
          type="submit"
          className="bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30 hover:bg-[#10b981]/20 px-4 py-1.5 rounded-lg text-sm font-medium transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)]"
        >
          Aplicar
        </button>
      </div>
    </form>
  )
}