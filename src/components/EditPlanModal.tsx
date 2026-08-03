'use client'

import { useState } from 'react'
import { ArrowUpCircle } from 'lucide-react'
import { alterarPlanoIgreja } from '@/app/actions/superadmin'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'

interface EditPlanModalProps {
  igrejaId: string
  currentPlan?: string | null
  currentVencimento?: number | null
}

const PLAN_OPTIONS = [
  { value: 'START', label: 'START' },
  { value: 'PRO', label: 'PRO' },
  { value: 'PREMIUM', label: 'PREMIUM' },
]

export default function EditPlanModal({ igrejaId, currentPlan, currentVencimento }: EditPlanModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [plano, setPlano] = useState(currentPlan || 'START')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const novoVencimentoStr = formData.get('dia_vencimento') as string
    const novoVencimento = novoVencimentoStr ? parseInt(novoVencimentoStr, 10) : undefined

    await alterarPlanoIgreja(igrejaId, plano, novoVencimento)

    setIsOpen(false)
    setIsLoading(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-xs px-4 py-2 rounded-[var(--radius-field)] font-semibold bg-transparent border border-[var(--color-accent)]/30 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
        title="Upgrade ou Editar Plano"
      >
        <ArrowUpCircle className="w-3.5 h-3.5" />
        Upgrade
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Editar Assinatura" size="sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="plano" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
              Plano
            </label>
            <Select value={plano} onChange={setPlano} options={PLAN_OPTIONS} name="plano" />
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
              className="input-field"
              placeholder="Ex: 5"
            />
          </div>

          <div className="mt-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] bg-transparent rounded-[var(--radius-field)] hover:bg-[var(--color-base-200)] hover:text-[var(--text-color)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-[var(--color-accent-content)] bg-[var(--color-accent)] rounded-[var(--radius-field)] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
