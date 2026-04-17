'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ReceiptText, PieChart, Settings, Users, LogOut, Key, Menu, ChevronRight, X, Crown } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { sairModoSuporte } from '@/app/actions/superadmin'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/lancamentos', label: 'Lançamentos', icon: ReceiptText },
  { href: '/relatorios', label: 'Relatórios', icon: PieChart },
  { href: '/usuarios', label: 'Usuários', icon: Users },
  { href: '/funcoes', label: 'Funções', icon: Key },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export default function Sidebar({ 
  userPermissions = [], 
  userName = '',
  churchName = 'Sua Igreja'
}: { 
  userPermissions?: string[], 
  userName?: string,
  churchName?: string
}) {
  const pathname = usePathname()
  
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  
  // Estado para o Menu no Mobile
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Função para fechar o menu no celular ao clicar em um link
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(false)
    }
  }

  return (
    <>
      {/* BARRA DE TOPO MOBILE */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--bg-page)] border-b border-[var(--border-tint)] z-40 flex items-center justify-between px-5 backdrop-blur-md shadow-md">
        <span className="text-xl font-bold text-[var(--primary-color)] drop-shadow-[0_0_10px_var(--primary-glow)]">
          ChurchFin
        </span>
        <button onClick={() => setIsMobileOpen(true)} className="p-2 text-[var(--text-muted)] hover:text-white transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* OVERLAY MOBILE */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-[fadeIn_0.2s_ease-out]" 
          onClick={() => setIsMobileOpen(false)} 
        />
      )}

      {/* SIDEBAR PRINCIPAL */}
      <aside 
        className={`sidebar-glass flex flex-col flex-shrink-0 h-full overflow-hidden transition-all duration-300 ease-in-out z-50 fixed md:relative top-0 left-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-20 md:px-3' : 'w-64 px-5'}`}
        style={{ paddingBottom: '2rem', paddingTop: '2rem' }}
      >
        {/* Header do Menu (Logo PNG) */}
        <div className={`mb-10 flex items-center h-8 transition-all duration-300 ${isCollapsed ? 'md:justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <img src="/logo-c.png" alt="ChurchFin Logo" className={`h-auto object-contain flex-shrink-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'md:w-0 md:opacity-0' : 'w-[160px] opacity-100'}`} />
          </div>
          <button className="md:hidden p-1 text-[var(--text-muted)] hover:text-white" onClick={() => setIsMobileOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navegação Principal */}
        <nav className="flex flex-col gap-2 flex-1 overflow-x-hidden overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isMaster = userPermissions[0] === '*'
            if (!isMaster) {
              if (item.label === 'Dashboard' && !userPermissions.includes('dashboard.visualizar')) return null
              if (item.label === 'Lançamentos' && !userPermissions.includes('lancamentos.visualizar')) return null
              if (item.label === 'Relatórios' && !userPermissions.includes('relatorios.visualizar')) return null
              if (item.label === 'Usuários' && !userPermissions.includes('usuarios.visualizar')) return null
              if (item.label === 'Funções' && !userPermissions.includes('funcoes.visualizar')) return null
              if (item.label === 'Configurações' && !userPermissions.includes('configuracoes.visualizar')) return null
            }

            const isActive = pathname.startsWith(item.href) && item.label !== 'Configurações'
            const isConfigActive = pathname.startsWith('/configuracoes')
            const Icon = item.icon
            
            // Tratamento Especial para Configurações (Menu Sanfona)
            if (item.label === 'Configurações') {
              return (
                <div key={item.href} className="flex flex-col">
                  <button
                    onClick={() => {
                      if (isCollapsed && window.innerWidth >= 768) setIsCollapsed(false)
                      setIsConfigOpen(!isConfigOpen)
                    }}
                    className={`nav-item flex items-center justify-between rounded-lg transition-colors duration-200 ${
                      isConfigActive && !isConfigOpen ? 'bg-white/5 text-white' : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
                    } ${isCollapsed ? 'md:justify-center p-3' : 'px-4 py-3'}`}
                  >
                    <div className="flex items-center">
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out text-left ${
                        isCollapsed ? 'md:w-0 md:opacity-0 md:ml-0' : 'w-40 opacity-100 ml-3'
                      }`}>
                        {item.label}
                      </span>
                    </div>
                    {(!isCollapsed || window.innerWidth < 768) && (
                      <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isConfigOpen ? 'rotate-90 text-white' : ''}`} />
                    )}
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out flex flex-col gap-1 ${
                    isConfigOpen && (!isCollapsed || window.innerWidth < 768) ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'
                  }`}>
                    <Link href="/configuracoes/cultos" onClick={handleLinkClick} className={`pl-12 py-2 pr-4 text-sm rounded-lg transition-colors ${
                      pathname.includes('/cultos') ? 'text-white bg-white/10' : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
                    }`}>
                      Cultos e Categorias
                    </Link>
                    <Link href="/configuracoes/personalizacao" onClick={handleLinkClick} className={`pl-12 py-2 pr-4 text-sm rounded-lg transition-colors ${
                      pathname.includes('/personalizacao') ? 'text-white bg-white/10' : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
                    }`}>
                      Personalização
                    </Link>
                  </div>
                </div>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                title={isCollapsed ? item.label : undefined}
                className={`nav-item flex items-center rounded-lg transition-colors duration-200 ${
                  isActive ? 'active bg-white/10 text-white' : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
                } ${isCollapsed ? 'md:justify-center p-3' : 'px-4 py-3'}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
                  isCollapsed ? 'md:w-0 md:opacity-0 md:ml-0' : 'w-40 opacity-100 ml-3'
                }`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* 🔥 BOTÃO DE SAIR DO SUPORTE (Fundo Transparente & Centralizado) */}
        {userPermissions[0] === '*' && churchName !== 'Ministério Sol da Justiça' && (
          <div className="px-0 md:px-0 mb-4 mt-2 flex justify-center">
            <form action={sairModoSuporte} className="flex justify-center w-full">
              <button
                type="submit"
                title={isCollapsed ? "Sair do Suporte" : undefined}
                className={`flex items-center justify-center rounded-lg transition-all duration-300 bg-transparent text-rose-400 border border-transparent hover:bg-rose-500/10 hover:border-rose-500/30 hover:shadow-[0_0_10px_rgba(244,63,94,0.15)] ${
                  isCollapsed ? 'p-2' : 'px-5 py-2 text-sm'
                }`}
              >
                <LogOut className="w-4 h-4 flex-shrink-0 rotate-180" />
                <span className={`font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${
                  isCollapsed ? 'w-0 opacity-0 ml-0 overflow-hidden' : 'opacity-100 ml-2'
                }`}>
                  Sair do Suporte
                </span>
              </button>
            </form>
          </div>
        )}

        {/* 🔥 BOTÃO SUPER ADMIN (Fundo Transparente & Centralizado) */}
        {userPermissions[0] === '*' && churchName === 'Ministério Sol da Justiça' && (
          <div className="px-0 md:px-0 mb-4 mt-2 flex justify-center">
            <Link
              href="/super-admin"
              onClick={handleLinkClick}
              title={isCollapsed ? "Painel Master" : undefined}
              className={`flex items-center justify-center rounded-lg transition-all duration-300 bg-transparent text-amber-500 border border-transparent hover:bg-amber-500/10 hover:border-amber-500/30 hover:shadow-[0_0_10px_rgba(245,158,11,0.15)] ${
                isCollapsed ? 'p-2' : 'px-5 py-2 text-sm'
              }`}
            >
              <Crown className="w-4 h-4 flex-shrink-0" />
              <span className={`font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${
                isCollapsed ? 'w-0 opacity-0 ml-0 overflow-hidden' : 'opacity-100 ml-2'
              }`}>
                Painel Master
              </span>
            </Link>
          </div>
        )}

        {/* Botão de Toggle Antigravidade (Apenas Desktop) */}
        <div className={`hidden md:flex mb-4 ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
          <button 
            onClick={() => { setIsCollapsed(!isCollapsed); if(!isCollapsed) setIsConfigOpen(false); }}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-colors"
            title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* RODAPÉ: Usuário e Nome da Igreja */}
        <div className={`pt-4 border-t border-[rgba(255,255,255,0.08)] flex items-center ${isCollapsed ? 'md:flex-col md:gap-4 md:justify-center' : 'justify-between px-2 md:px-0'}`}>
          <div className={`flex flex-col overflow-hidden transition-all duration-300 ${
              isCollapsed ? 'md:w-0 md:h-0 md:opacity-0' : 'w-[150px] opacity-100'
            }`}>
            <span className="text-sm font-semibold text-white truncate">
              {userName}
            </span>
            <span className="text-[11px] font-medium text-[var(--text-muted)] truncate mt-0.5">
              {churchName}
            </span>
          </div>

          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>
    </>
  )
}