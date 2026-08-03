'use client'

import { useTheme } from 'next-themes'
import { Palette, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'

import { updateChurchName, getChurchName } from '@/app/actions/config'

export default function PersonalizacaoPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [nomeIgreja, setNomeIgreja] = useState('')
  const [loadingFetch, setLoadingFetch] = useState(true)
  const [loadingSave, setLoadingSave] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getChurchName().then((nome) => {
      setNomeIgreja(nome)
      setLoadingFetch(false)
    }).catch(() => {
      setLoadingFetch(false)
    })
  }, [])

  const handleSaveName = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoadingSave(true)
    setSuccess(false)
    setError('')

    const formData = new FormData(e.currentTarget)
    const res = await updateChurchName(formData)

    if (res.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(res.error || 'Erro ao salvar')
    }
    setLoadingSave(false)
  }

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out]">
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 rounded-xl bg-[var(--color-base-200)] border border-[var(--border-tint)]">
          <Palette className="w-6 h-6 text-[var(--primary-color)] transition-colors" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-color)]">Personalização</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Configure a identidade visual e os dados do seu ChurchFep</p>
        </div>
      </div>

      {/* Painel do Nome da Igreja */}
      <div className="card-glass p-8 rounded-2xl relative">
        <h2 className="text-lg font-medium text-[var(--text-color)] mb-2">Dados da Igreja</h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">Edite o nome da sua congregação exibido no menu do sistema.</p>

        {loadingFetch ? (
          <div className="h-[42px] flex items-center text-sm text-[var(--text-muted)]">Carregando dados...</div>
        ) : (
          <form onSubmit={handleSaveName} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex flex-col gap-2 w-full sm:w-96">
              <label className="text-sm font-medium text-[var(--text-muted)]">Nome exibido</label>
              <input 
                type="text" 
                name="nome" 
                required 
                value={nomeIgreja}
                onChange={e => setNomeIgreja(e.target.value)}
                className="input-field w-full"
                placeholder="Ex: Igreja Batista Central" 
              />
            </div>
            
            <button
              type="submit"
              disabled={loadingSave}
              className="btn-primary h-[42px] px-6 rounded-lg font-semibold transition-all hover:brightness-110 disabled:opacity-50 flex-shrink-0"
            >
              {loadingSave ? 'Salvando...' : 'Salvar Alteração'}
            </button>
          </form>
        )}

        {success && <p className="mt-4 text-sm text-emerald-400 font-medium animate-[fadeIn_0.2s_ease-out]">✓ Nome atualizado com sucesso no menu!</p>}
        {error && <p className="mt-4 text-sm text-red-400 font-medium animate-[fadeIn_0.2s_ease-out]">⚠️ {error}</p>}
      </div>

      {/* Painel de Tema */}
      <div className="card-glass p-8 rounded-2xl relative">
        <h2 className="text-lg font-medium mb-6">Aparência</h2>
        {mounted && (
          <div className="flex gap-3">
            <button
              onClick={() => setTheme('ledger')}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg border text-sm font-medium transition-colors ${
                theme === 'ledger' ? 'border-[var(--primary-color)] text-[var(--primary-color)]' : 'border-[var(--border-tint)] text-[var(--text-muted)] hover:text-[var(--text-color)]'
              }`}
            >
              <Sun className="w-4 h-4" /> Claro
            </button>
            <button
              onClick={() => setTheme('ledger-dark')}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg border text-sm font-medium transition-colors ${
                theme === 'ledger-dark' ? 'border-[var(--primary-color)] text-[var(--primary-color)]' : 'border-[var(--border-tint)] text-[var(--text-muted)] hover:text-[var(--text-color)]'
              }`}
            >
              <Moon className="w-4 h-4" /> Escuro
            </button>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}