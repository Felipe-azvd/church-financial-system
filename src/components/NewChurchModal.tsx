'use client'

import { useState } from 'react'
import { Building2, User, Mail, Lock } from 'lucide-react'
import { criarNovaIgreja } from '@/app/actions/superadmin'
import { Modal } from '@/components/ui/Modal'

export default function NewChurchModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData(e.currentTarget)
    const res = await criarNovaIgreja(formData)

    if (res.success) {
      setSuccess('Igreja criada e configurada com sucesso!')
      setTimeout(() => {
        onClose()
        setSuccess('')
      }, 2000)
    } else {
      setError(res.error || 'Erro ao criar igreja.')
    }
    setLoading(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Igreja" description="Configure o novo inquilino e seu administrador master." size="md">
      {error && <div className="mb-4 p-3 rounded-[var(--radius-field)] bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)] text-sm font-medium">{error}</div>}
      {success && <div className="mb-4 p-3 rounded-[var(--radius-field)] bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 text-[var(--color-success)] text-sm font-semibold">{success}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[var(--color-accent)]" /> Nome da Igreja
          </label>
          <input name="nomeIgreja" required className="input-field" placeholder="Ex: Igreja Central" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4 text-[var(--color-accent)]" /> Nome do Responsável (Admin)
          </label>
          <input name="nomeAdmin" required className="input-field" placeholder="Ex: Pr. João" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Mail className="w-4 h-4 text-[var(--color-accent)]" /> E-mail de Login
          </label>
          <input type="email" name="emailAdmin" required className="input-field" placeholder="admin@igreja.com" />
        </div>

        <div className="flex flex-col gap-2 mb-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Lock className="w-4 h-4 text-[var(--color-accent)]" /> Senha Inicial
          </label>
          <input type="text" name="senhaAdmin" required className="input-field" placeholder="Defina uma senha" />
        </div>

        <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-[var(--color-base-300)]">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-[var(--radius-field)] font-medium text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="px-6 py-2 rounded-[var(--radius-field)] font-semibold text-[var(--color-accent-content)] bg-[var(--color-accent)] hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? 'Criando...' : 'Criar Igreja'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
