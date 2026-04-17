'use client'

import { useTheme } from '@/components/ThemeProvider'
import { Check, Palette } from 'lucide-react'
import { useState, useEffect } from 'react'

// 👇 ATENÇÃO AQUI: Arrume o nome do arquivo no final dessa linha
import { updateChurchName, getChurchName } from '@/app/actions/config'

const THEMES = [
  { id: 'green', name: 'Verde (Padrão)', hex: '#10b981', desc: 'Crescimento e estabilidade' },
  { id: 'blue', name: 'Azul Oceano', hex: '#3b82f6', desc: 'Serenidade e confiança' },
  { id: 'purple', name: 'Roxo Real', hex: '#8b5cf6', desc: 'Modernidade e nobreza' },
  { id: 'orange', name: 'Laranja Vibrante', hex: '#f97316', desc: 'Energia e calor' },
  { id: 'yellow', name: 'Amarelo Ouro', hex: '#eab308', desc: 'Alegria e otimismo' },
] as const

export default function PersonalizacaoPage() {
  const { color, setColor } = useTheme()

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
        <div className="p-3 rounded-xl bg-black/20 border border-white/10">
          <Palette className="w-6 h-6 text-[var(--primary-color)] transition-colors" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">Personalização</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Configure a identidade visual e os dados do seu ChurchFin</p>
        </div>
      </div>

      {/* Painel do Nome da Igreja */}
      <div className="card-glass p-8 rounded-2xl relative">
        <h2 className="text-lg font-medium text-white mb-2">Dados da Igreja</h2>
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
                className="input-field h-[42px] px-4 bg-black/40 border border-white/10 rounded-lg text-white focus:border-[var(--primary-color)] transition-all outline-none w-full" 
                placeholder="Ex: Igreja Batista Central" 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loadingSave}
              className="h-[42px] px-6 rounded-lg font-semibold text-white bg-[var(--primary-color)] transition-all disabled:opacity-50 flex-shrink-0 hover:brightness-110"
            >
              {loadingSave ? 'Salvando...' : 'Salvar Alteração'}
            </button>
          </form>
        )}

        {success && <p className="mt-4 text-sm text-emerald-400 font-medium animate-[fadeIn_0.2s_ease-out]">✓ Nome atualizado com sucesso no menu!</p>}
        {error && <p className="mt-4 text-sm text-red-400 font-medium animate-[fadeIn_0.2s_ease-out]">⚠️ {error}</p>}
      </div>

      {/* Painel de Cores */}
      <div className="card-glass p-8 rounded-2xl relative">
        <h2 className="text-lg font-medium text-white mb-6">Cores do Tema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {THEMES.map((theme) => {
            const isActive = color === theme.id
            return (
              <button
                key={theme.id}
                onClick={() => setColor(theme.id as any)}
                className={`relative flex flex-col items-center p-6 rounded-xl border transition-all duration-300 outline-none group ${
                  isActive ? 'bg-white/10 border-[var(--primary-color)] scale-105 shadow-[0_0_20px_var(--primary-glow)]' : 'bg-black/20 border-white/5 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                {isActive && <div className="absolute top-3 right-3 text-[var(--primary-color)]"><Check className="w-5 h-5" /></div>}
                <div className="w-16 h-16 rounded-full mb-4 shadow-lg transition-transform group-hover:scale-110" style={{ backgroundColor: theme.hex, boxShadow: `0 4px 20px ${theme.hex}60` }} />
                <span className={`font-semibold mb-1 ${isActive ? 'text-white' : 'text-gray-300'}`}>{theme.name}</span>
                <span className="text-xs text-[var(--text-muted)] text-center">{theme.desc}</span>
              </button>
            )
          })}
        </div>
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