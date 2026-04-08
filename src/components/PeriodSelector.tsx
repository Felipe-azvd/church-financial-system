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

  // Sincroniza com a URL
  useEffect(() => {
    setValue(currentFilter)
  }, [currentFilter])

  // Lógica para fechar o dropdown ao clicar fora dele
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
    setIsOpen(false) // Fecha o menu ao selecionar
    const params = new URLSearchParams(searchParams.toString())
    params.set('filter', newValue)
    router.push(`/dashboard?${params.toString()}`)
  }

  // Only render on dashboard
  if (!pathname.startsWith('/dashboard')) return null

  const selectedLabel = PERIOD_OPTIONS.find(opt => opt.value === value)?.label || 'Selecione'

  return (
    <div className="flex items-center gap-3" ref={dropdownRef}>
      <label className="text-[0.95rem] font-medium text-[var(--text-muted)] whitespace-nowrap">
        Período:
      </label>
      
      {/* Container Relativo para ancorar o Dropdown */}
      <div className="relative">
        
        {/* Botão Gatilho Sólido (Sem efeito vidro) */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between gap-3 bg-[#1a1f2b] border border-white/10 text-white rounded-lg hover:border-[#3b82f6] transition-all outline-none"
          style={{ height: '42px', minWidth: '160px', padding: '0 1rem', fontSize: '0.95rem' }}
        >
          <span className="flex-1 text-center font-medium">{selectedLabel}</span>
          <ChevronDown 
            size={16} 
            className={`text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Menu Flutuante de Opções (Fundo Sólido) */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-full bg-[#1a1f2b] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50 animate-[fadeIn_0.1s_ease-out]">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleChange(opt.value)}
                className={`w-full block text-center px-4 py-3 text-[0.95rem] font-medium transition-colors ${
                  value === opt.value
                    ? 'bg-blue-500/10 text-blue-400' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
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