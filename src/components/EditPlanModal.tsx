'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUpCircle, X } from 'lucide-react'
import { alterarPlanoIgreja } from '@/app/actions/superadmin'

interface EditPlanModalProps {
  igrejaId: string
  currentPlan?: string | null
  currentVencimento?: number | null
}

export default function EditPlanModal({ igrejaId, currentPlan, currentVencimento }: EditPlanModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const novoPlano = formData.get('plano') as string
    const novoVencimentoStr = formData.get('dia_vencimento') as string
    const novoVencimento = novoVencimentoStr ? parseInt(novoVencimentoStr, 10) : undefined

    await alterarPlanoIgreja(igrejaId, novoPlano, novoVencimento)
    
    setIsOpen(false)
    setIsLoading(false)
  }

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-[#0a1511] border border-[var(--border-tint)] rounded-2xl p-6 shadow-2xl w-full max-w-md relative text-left">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold text-white mb-4">Editar Assinatura</h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="plano" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
              Plano
            </label>
            <select 
              name="plano" 
              id="plano"
              defaultValue={currentPlan || ''}
              required
              className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all appearance-none"
            >
              <option value="" disabled className="text-gray-500">Selecione o plano</option>
              <option value="START" className="bg-[#0a1511] text-white">START</option>
              <option value="PRO" className="bg-[#0a1511] text-white">PRO</option>
              <option value="PREMIUM" className="bg-[#0a1511] text-white">PREMIUM</option>
            </select>
          </div>

          <div>
            <label htmlFor="dia_vencimento" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
              Dia do Vencimento
            </label>
            <input 
              type="number" 
              name="dia_vencimento" 
              id="dia_vencimento"
              min="1"
              max="31"
              defaultValue={currentVencimento || ''}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder-[var(--text-muted)]"
              placeholder="Ex: 5"
            />
          </div>

          <div className="mt-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] bg-transparent rounded-lg hover:bg-white/5 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-500 transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg font-semibold bg-transparent border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-all shadow-[0_0_10px_rgba(59,130,246,0.05)] hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]"
        title="Upgrade ou Editar Plano"
      >
        <ArrowUpCircle className="w-3.5 h-3.5" />
        Upgrade
      </button>

      {mounted && modalContent ? createPortal(modalContent, document.body) : null}
    </>
  )
}
