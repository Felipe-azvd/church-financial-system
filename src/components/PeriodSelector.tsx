'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

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
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setValue(currentFilter)
  }, [currentFilter])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (newValue: string) => {
    setValue(newValue)
    setIsOpen(false)
    const params = new URLSearchParams(searchParams.toString())
    params.set('filter', newValue)
    router.push(`/dashboard?${params.toString()}`)
  }

  if (!pathname.startsWith('/dashboard')) return null

  const selectedLabel = PERIOD_OPTIONS.find(opt => opt.value === value)?.label || 'Selecione'

  return (
    <div className="flex items-center gap-3" ref={dropdownRef}>
      <label className="text-[0.95rem] font-medium text-[var(--text-muted)] whitespace-nowrap">
        Período:
      </label>
      
      <div className="relative">
        {/* Botão Sólido usando bg-page */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between gap-3 bg-[var(--bg-page)] border border-[var(--border-tint)] text-white rounded-lg hover:border-[var(--primary-color)] transition-all outline-none shadow-md"
          style={{ height: '42px', minWidth: '160px', padding: '0 1rem', fontSize: '0.95rem' }}
        >
          <span className="flex-1 text-center font-medium">{selectedLabel}</span>
          <ChevronDown 
            size={16} 
            className={`text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Menu Flutuante Sólido usando bg-page */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-full bg-[var(--bg-page)] border border-[var(--border-tint)] rounded-lg shadow-2xl overflow-hidden z-50 animate-[fadeIn_0.1s_ease-out]">
            {PERIOD_OPTIONS.map(opt => {
              const isSelected = value === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => handleChange(opt.value)}
                  className={`w-full block text-center px-4 py-3 text-[0.95rem] font-medium transition-colors ${
                    isSelected
                      ? 'text-[var(--primary-color)]' 
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                  style={{ backgroundColor: isSelected ? 'var(--primary-soft)' : 'transparent' }}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}