'use client'

import { useState } from 'react'
import { updateChurchName } from '@/app/actions/settings'

export default function ChurchNameForm({ initialName }: { initialName: string }) {
  const [nome, setNome] = useState(initialName)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError('')

    const formData = new FormData(e.currentTarget)
    const res = await updateChurchName(formData)

    if (res.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(res.error || 'Erro desconhecido')
    }
    setLoading(false)
  }

  return (
    <div className="mb-8 p-6 rounded-2xl border border-[var(--border-tint)] bg-black/20 backdrop-blur-md shadow-xl w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white tracking-tight">Dados da Igreja</h3>
        <p className="text-sm text-[var(--text-muted)]">Edite o nome da sua congregação exibido no menu do sistema.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex flex-col gap-2 w-full sm:w-96">
          <label className="text-sm font-medium text-[var(--text-muted)]">Nome da Igreja</label>
          <input 
            type="text" 
            name="nome" 
            required 
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="input-field h-[42px] px-4 bg-black/40 border border-white/10 rounded-lg text-white focus:border-[var(--primary-color)] transition-all outline-none w-full" 
            placeholder="Ex: Igreja Batista Central" 
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="h-[42px] px-6 rounded-lg font-semibold text-white bg-[var(--primary-color)] transition-all disabled:opacity-50 flex-shrink-0 hover:brightness-110"
        >
          {loading ? 'Salvando...' : 'Salvar Alteração'}
        </button>
      </form>

      {success && <p className="mt-3 text-sm text-emerald-400 font-medium">✓ Nome atualizado com sucesso!</p>}
      {error && <p className="mt-3 text-sm text-red-400 font-medium">⚠️ {error}</p>}
    </div>
  )
}