'use client'

import { useTheme } from '@/components/ThemeProvider'
import { Check, Palette } from 'lucide-react'

// Mapeamento das cores para a interface
const THEMES = [
  { id: 'green', name: 'Verde (Padrão)', hex: '#10b981', desc: 'Crescimento e estabilidade' },
  { id: 'blue', name: 'Azul Oceano', hex: '#3b82f6', desc: 'Serenidade e confiança' },
  { id: 'purple', name: 'Roxo Real', hex: '#8b5cf6', desc: 'Modernidade e nobreza' },
  { id: 'orange', name: 'Laranja Vibrante', hex: '#f97316', desc: 'Energia e calor' },
  { id: 'yellow', name: 'Amarelo Ouro', hex: '#eab308', desc: 'Alegria e otimismo' },
] as const

export default function PersonalizacaoPage() {
  const { color, setColor } = useTheme()

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 rounded-xl bg-black/20 border border-white/10">
          <Palette className="w-6 h-6 text-[var(--primary-color)] transition-colors" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">Personalização</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Escolha a cor de destaque do seu ChurchFin</p>
        </div>
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
                  isActive 
                    ? 'bg-white/10 border-[var(--primary-color)] scale-105 shadow-[0_0_20px_var(--primary-glow)]' 
                    : 'bg-black/20 border-white/5 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                {/* Indicador de Ativo */}
                {isActive && (
                  <div className="absolute top-3 right-3 text-[var(--primary-color)]">
                    <Check className="w-5 h-5" />
                  </div>
                )}

                {/* Bolinha da Cor */}
                <div 
                  className="w-16 h-16 rounded-full mb-4 shadow-lg transition-transform group-hover:scale-110"
                  style={{ backgroundColor: theme.hex, boxShadow: `0 4px 20px ${theme.hex}60` }}
                />

                <span className={`font-semibold mb-1 ${isActive ? 'text-white' : 'text-gray-300'}`}>
                  {theme.name}
                </span>
                <span className="text-xs text-[var(--text-muted)] text-center">
                  {theme.desc}
                </span>
              </button>
            )
          })}
        </div>

        {/* Card de Preview (Para mostrar o poder do CSS em tempo real) */}
        <div className="mt-12 p-6 rounded-xl border border-white/10 bg-black/20">
          <h3 className="text-sm font-medium text-[var(--text-muted)] mb-4 uppercase tracking-wider">Preview Instantâneo</h3>
          <div className="flex flex-wrap items-center gap-4">
            <button className="btn-primary !rounded-lg px-6 py-2">
              Botão Principal
            </button>
            <span className="badge badge-soft" style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary-color)' }}>
              Badge de Status
            </span>
            <div className="text-[var(--primary-color)] font-semibold">
              Texto de Destaque
            </div>
          </div>
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