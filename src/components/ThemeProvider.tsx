'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type ThemeColor = 'green' | 'blue' | 'purple' | 'orange' | 'yellow'

interface ThemeContextType {
  color: ThemeColor
  setColor: (c: ThemeColor) => void
}

const ThemeContext = createContext<ThemeContextType>({ color: 'green', setColor: () => {} })

export const useTheme = () => useContext(ThemeContext)

// Paleta de cores MESTRE (Dark Mode Suavizado - Mais legível e elegante)
const THEMES = {
  green: { 
    primary: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', soft: 'rgba(16, 185, 129, 0.1)',
    bgPage: '#0b1a14', surface: 'rgba(16, 185, 129, 0.05)', borderTint: 'rgba(16, 185, 129, 0.15)'
  },
  blue: { 
    primary: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)', soft: 'rgba(59, 130, 246, 0.1)',
    bgPage: '#0b131f', surface: 'rgba(59, 130, 246, 0.05)', borderTint: 'rgba(59, 130, 246, 0.15)'
  },
  purple: { 
    primary: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)', soft: 'rgba(139, 92, 246, 0.1)',
    bgPage: '#110b1f', surface: 'rgba(139, 92, 246, 0.05)', borderTint: 'rgba(139, 92, 246, 0.15)'
  },
  orange: { 
    primary: '#f97316', glow: 'rgba(249, 115, 22, 0.4)', soft: 'rgba(249, 115, 22, 0.1)',
    bgPage: '#1f130b', surface: 'rgba(249, 115, 22, 0.05)', borderTint: 'rgba(249, 115, 22, 0.15)'
  },
  yellow: { 
    primary: '#eab308', glow: 'rgba(234, 179, 8, 0.4)', soft: 'rgba(234, 179, 8, 0.1)',
    bgPage: '#1f1a0b', surface: 'rgba(234, 179, 8, 0.05)', borderTint: 'rgba(234, 179, 8, 0.15)'
  },
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [color, setColor] = useState<ThemeColor>('green')
  const [mounted, setMounted] = useState(false)

  // Recupera a cor salva
  useEffect(() => {
    const saved = localStorage.getItem('churchfin-theme') as ThemeColor
    if (saved && THEMES[saved]) {
      setColor(saved)
    }
    setMounted(true)
  }, [])

  // Salva a cor no navegador
  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('churchfin-theme', color)
  }, [color, mounted])

  const activeTheme = THEMES[color]

  return (
    <ThemeContext.Provider value={{ color, setColor }}>
      {mounted && (
        <style dangerouslySetInnerHTML={{__html: `
          :root {
            /* Variáveis de Destaque */
            --primary-color: ${activeTheme.primary};
            --primary-glow: ${activeTheme.glow};
            --primary-soft: ${activeTheme.soft};
            
            /* Variáveis de Fundo e Estrutura */
            --bg-page: ${activeTheme.bgPage};
            --surface-tint: ${activeTheme.surface};
            --border-tint: ${activeTheme.borderTint};
          }

          /* Injeção Mágica: Aplica a tintura em tudo sem precisar mudar o código das telas */
          body {
            background-color: var(--bg-page) !important;
            transition: background-color 0.4s ease;
          }

          .sidebar-glass, .card-glass {
            background-color: var(--surface-tint) !important;
            border-color: var(--border-tint) !important;
            transition: background-color 0.4s ease, border-color 0.4s ease;
          }

          /* Garante que até as tabelas e headers recebam a tintura sutil */
          table th {
            background-color: var(--surface-tint) !important;
          }
        `}} />
      )}
      {children}
    </ThemeContext.Provider>
  )
}