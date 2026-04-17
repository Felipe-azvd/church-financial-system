'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Building2, User, Mail, Lock } from 'lucide-react'
import { criarNovaIgreja } from '@/app/actions/superadmin' 

export default function NewChurchModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setMounted(true)
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // Se não estiver aberto ou o componente ainda não montou no cliente, não renderiza nada
  if (!isOpen || !mounted) return null

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

  // O conteúdo do Modal
  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-[var(--bg-page)] border border-[var(--border-tint)] w-[95%] sm:w-[90%] max-w-[500px] p-6 sm:p-8 rounded-2xl shadow-2xl relative">
        
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-1">Nova Igreja</h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">Configure o novo inquilino e seu administrador master.</p>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">{error}</div>}
        {success && <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">{success}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" /> Nome da Igreja
            </label>
            <input name="nomeIgreja" required className="input-field h-[42px] px-3 bg-black/20 text-white border border-white/10 rounded-lg focus:border-amber-500/50 outline-none" placeholder="Ex: Igreja Central" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" /> Nome do Responsável (Admin)
            </label>
            <input name="nomeAdmin" required className="input-field h-[42px] px-3 bg-black/20 text-white border border-white/10 rounded-lg focus:border-amber-500/50 outline-none" placeholder="Ex: Pr. João" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-500" /> E-mail de Login
            </label>
            <input type="email" name="emailAdmin" required className="input-field h-[42px] px-3 bg-black/20 text-white border border-white/10 rounded-lg focus:border-amber-500/50 outline-none" placeholder="admin@igreja.com" />
          </div>

          <div className="flex flex-col gap-2 mb-2">
            <label className="text-sm font-medium text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500" /> Senha Inicial
            </label>
            <input type="text" name="senhaAdmin" required className="input-field h-[42px] px-3 bg-black/20 text-white border border-white/10 rounded-lg focus:border-amber-500/50 outline-none" placeholder="Defina uma senha" />
          </div>

          <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg font-medium text-[var(--text-muted)] hover:text-white transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2 rounded-lg font-bold text-black bg-amber-500 hover:bg-amber-400 transition-all disabled:opacity-50">
              {loading ? 'Criando...' : 'Criar Igreja'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  // 🔥 Aqui está a mágica: Ele renderiza fora da tabela, direto no <body> do site!
  return createPortal(modalContent, document.body)
}