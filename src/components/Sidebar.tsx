'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/ui/Logo'
import { 
  LayoutDashboard, ReceiptText, PieChart, Settings, Users, 
  LogOut, Key, Menu, ChevronRight, X, Crown,
  Building2, History, CreditCard, ShieldCheck, ChevronsUpDown, Star
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { sairModoSuporte } from '@/app/actions/superadmin'
import { alternarIgrejaAtiva } from '@/app/actions/user'

const navItemsCliente = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/lancamentos', label: 'Lançamentos', icon: ReceiptText },
  { href: '/relatorios', label: 'Relatórios', icon: PieChart },
  { href: '/usuarios', label: 'Usuários', icon: Users },
  { href: '/funcoes', label: 'Funções', icon: Key },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

const navItemsMaster = [
  { href: '/super-admin', label: 'Visão Geral', icon: ShieldCheck },
  { href: '/super-admin/igrejas', label: 'Gerenciar Igrejas', icon: Building2 },
  { href: '/super-admin/auditoria', label: 'Auditoria', icon: History }, // 🔥 Trocado para apenas "Auditoria"
  { href: '/super-admin/financeiro', label: 'Assinaturas', icon: CreditCard },
]

export default function Sidebar({ 
  userPermissions = [], 
  userName = '',
  churchName = 'Sua Igreja',
  churchNetwork = []
}: { 
  userPermissions?: string[], 
  userName?: string,
  churchName?: string,
  churchNetwork?: { id: string, nome: string, isMatriz: boolean }[]
}) {
  const pathname = usePathname()
  const isMasterArea = pathname.startsWith('/super-admin')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [isAuditoriaOpen, setIsAuditoriaOpen] = useState(false) // 🔥 Novo estado para o menu Auditoria
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isNetworkOpen, setIsNetworkOpen] = useState(false)

  const handleLinkClick = () => { if (window.innerWidth < 768) setIsMobileOpen(false) }
  const activeNavItems = isMasterArea ? navItemsMaster : navItemsCliente

  return (
    <>
      {/* MOBILE */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-neutral-dark border-b border-neutral/20 z-40 flex items-center justify-between px-5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8 text-primary" />
          <span className="font-bold text-lg text-white tracking-tight">Church<span className="text-primary">Fep</span></span>
        </div>
        <button onClick={() => setIsMobileOpen(true)} className="p-2 text-accent hover:text-white">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`bg-neutral-glass backdrop-blur-md border-r border-neutral/20 flex flex-col flex-shrink-0 h-full overflow-hidden transition-all duration-300 z-50 fixed md:relative top-0 left-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} ${isCollapsed ? 'w-64 md:w-20 px-5 md:px-3' : 'w-64 px-5'}`} style={{ paddingBottom: '2rem', paddingTop: '2rem' }}>
        
        {/* LOGO */}
        <div className={`mb-10 flex items-center min-h-[48px] transition-all duration-300 ${isCollapsed ? 'md:justify-center' : 'justify-center gap-3'}`}>
          <Logo className="w-10 h-10 flex-shrink-0 text-primary" />
          <span className={`font-bold text-2xl tracking-tight text-white transition-all duration-300 ${isCollapsed ? 'md:w-0 md:opacity-0 overflow-hidden' : 'opacity-100'}`}>
            Church<span className="text-primary">Fep</span>
          </span>
        </div>

        {/* MENU */}
        <nav className="flex flex-col gap-2 flex-1 overflow-x-hidden overflow-y-auto no-scrollbar">
          {activeNavItems.map((item) => {
            if (userPermissions[0] !== '*' && !isMasterArea) {
              const permKey = `${item.href.replace('/', '')}.visualizar`
              if (item.label !== 'Dashboard' && item.label !== 'Configurações' && !userPermissions.includes(permKey)) return null
            }

            const isActive = pathname === item.href || (item.href !== '/super-admin' && pathname.startsWith(item.href))
            const Icon = item.icon
            
            // 🔥 CONDICIONAL: MENU CONFIGURAÇÕES (CLIENTE)
            if (item.label === 'Configurações') {
              return (
                <div key={item.href} className="flex flex-col">
                  <button onClick={() => { if (isCollapsed) setIsCollapsed(false); setIsConfigOpen(!isConfigOpen); }} className={`flex items-center justify-between rounded-lg transition-colors duration-200 ${pathname.startsWith('/configuracoes') && !isConfigOpen ? 'bg-gradient-to-r from-primary/10 to-transparent text-primary shadow-glow font-medium' : 'text-accent hover:text-white hover:bg-white/5'} ${isCollapsed ? 'md:justify-center p-3' : 'px-4 py-3'}`}>
                    <div className="flex items-center">
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="ml-3 transition-all duration-300">{item.label}</span>}
                    </div>
                    {!isCollapsed && <ChevronRight className={`w-4 h-4 transition-transform ${isConfigOpen ? 'rotate-90' : ''}`} />}
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 flex flex-col gap-1 ${isConfigOpen && !isCollapsed ? 'max-h-64 mt-1 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <Link href="/configuracoes/cultos" onClick={handleLinkClick} className={`pl-12 py-2 text-sm rounded-lg ${pathname.includes('/cultos') ? 'bg-gradient-to-r from-primary/10 to-transparent text-primary shadow-glow' : 'text-accent hover:text-white'}`}>Cultos</Link>
                    <Link href="/configuracoes/personalizacao" onClick={handleLinkClick} className={`pl-12 py-2 text-sm rounded-lg ${pathname.includes('/personalizacao') ? 'bg-gradient-to-r from-primary/10 to-transparent text-primary shadow-glow' : 'text-accent hover:text-white'}`}>Personalização</Link>
                    <Link href="/configuracoes/changelog" onClick={handleLinkClick} className={`pl-12 py-2 text-sm rounded-lg ${pathname.includes('/changelog') ? 'bg-gradient-to-r from-primary/10 to-transparent text-primary shadow-glow' : 'text-accent hover:text-white'}`}>Atualizações</Link>
                  </div>
                </div>
              )
            }

            // 🔥 CONDICIONAL: MENU AUDITORIA (MASTER)
            if (item.label === 'Auditoria') {
              return (
                <div key={item.href} className="flex flex-col">
                  <button onClick={() => { if (isCollapsed) setIsCollapsed(false); setIsAuditoriaOpen(!isAuditoriaOpen); }} className={`flex items-center justify-between rounded-lg transition-colors duration-200 ${pathname.startsWith('/super-admin/auditoria') && !isAuditoriaOpen ? 'bg-amber-500/10 text-amber-500 font-medium' : 'text-accent hover:text-white hover:bg-white/5'} ${isCollapsed ? 'md:justify-center p-3' : 'px-4 py-3'}`}>
                    <div className="flex items-center">
                      <Icon className={`w-5 h-5 flex-shrink-0 ${pathname.startsWith('/super-admin/auditoria') ? 'text-amber-500' : ''}`} />
                      {!isCollapsed && <span className="ml-3 transition-all duration-300">{item.label}</span>}
                    </div>
                    {!isCollapsed && <ChevronRight className={`w-4 h-4 transition-transform ${isAuditoriaOpen ? 'rotate-90' : ''}`} />}
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 flex flex-col gap-1 ${isAuditoriaOpen && !isCollapsed ? 'max-h-40 mt-1 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <Link href="/super-admin/auditoria/clientes" onClick={handleLinkClick} className={`pl-12 py-2 text-sm rounded-lg ${pathname.includes('/auditoria/clientes') ? 'text-amber-500 bg-amber-500/10 font-medium' : 'text-accent hover:text-white'}`}>Auditoria Clientes</Link>
                    <Link href="/super-admin/auditoria/master" onClick={handleLinkClick} className={`pl-12 py-2 text-sm rounded-lg ${pathname.includes('/auditoria/master') || pathname === '/super-admin/auditoria' ? 'text-amber-500 bg-amber-500/10 font-medium' : 'text-accent hover:text-white'}`}>Auditoria Super Admin</Link>
                  </div>
                </div>
              )
            }

            // PADRÃO PARA OS DEMAIS ITENS
            return (
              <Link key={item.href} href={item.href} onClick={handleLinkClick} className={`flex items-center rounded-lg transition-all duration-200 ${isActive ? (isMasterArea ? 'bg-amber-500/10 text-amber-500 font-medium' : 'bg-gradient-to-r from-primary/10 to-transparent text-primary shadow-glow font-medium') : 'text-accent hover:text-white hover:bg-white/5'} ${isCollapsed ? 'md:justify-center p-3' : 'px-4 py-3'}`}>
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive && isMasterArea ? 'text-amber-500' : ''}`} />
                {!isCollapsed && <span className="ml-3 truncate transition-all duration-300">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* FOOTER ACTIONS */}
        <div className="mt-auto flex flex-col gap-2">
          
          {/* DOCK DE BOTÕES (ADMIN + OCULTAR) */}
          <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2' : 'flex-row justify-between'}`}>
            
            {/* ÁREA DO BOTÃO ADMINISTRATIVO */}
            <div className={isCollapsed ? '' : 'flex-1'}>
              {/* Se for Master e estiver no CLIENTE, mostra ENCERRAR SUPORTE */}
              {userPermissions[0] === '*' && churchName !== 'Ministério Sol da Justiça' && !isMasterArea && (
                <form action={sairModoSuporte} className="w-full">
                  <button 
                    type="submit" 
                    title={isCollapsed ? "Encerrar Suporte" : undefined}
                    className={`flex items-center justify-center rounded-lg transition-all duration-300 bg-transparent text-rose-400 border border-transparent hover:bg-rose-500/10 hover:border-rose-500/30 ${isCollapsed ? 'p-3' : 'px-5 py-2 text-sm font-medium w-full'}`}
                  >
                    <LogOut className="w-4 h-4 flex-shrink-0 rotate-180" />
                    {!isCollapsed && <span className="ml-2.5">Encerrar Suporte</span>}
                  </button>
                </form>
              )}

              {/* Se for Master, estiver na MATRIZ e NÃO estiver na Master Area, mostra PAINEL MASTER */}
              {userPermissions[0] === '*' && churchName === 'Ministério Sol da Justiça' && !isMasterArea && (
                <Link 
                  href="/super-admin" 
                  title={isCollapsed ? "Painel Master" : undefined}
                  className={`flex items-center justify-center rounded-lg transition-all duration-300 bg-transparent text-amber-500 border border-transparent hover:bg-amber-500/10 hover:border-amber-500/30 ${isCollapsed ? 'p-3' : 'px-5 py-2 text-sm font-medium w-full'}`}
                >
                  <Crown className="w-4 h-4 flex-shrink-0" />
                  {!isCollapsed && <span className="ml-2.5">Painel Master</span>}
                </Link>
              )}
            </div>

            {/* BOTÃO OCULTAR SIDEBAR */}
            {/* 🔥 Atualizado para fechar também o menu de Auditoria ao recolher */}
            <button 
              onClick={() => { setIsCollapsed(!isCollapsed); setIsConfigOpen(false); setIsAuditoriaOpen(false); }} 
              className={`p-2 rounded-lg text-accent hover:text-white hover:bg-white/10 transition-colors flex-shrink-0 ${isCollapsed ? '' : 'ml-2'}`}
              title={isCollapsed ? "Expandir" : "Recolher"}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* PERFIL E SELETOR DE REDE */}
          <div className={`relative pt-4 border-t border-white/5 flex items-center ${isCollapsed ? 'md:flex-col md:gap-4 md:justify-center' : 'justify-between px-2 md:px-0'}`}>
            {!isCollapsed && (
              <div className="flex flex-col flex-1 min-w-0 pr-2 relative">
                <span className="text-sm font-semibold text-white truncate">{userName}</span>
                
                {churchNetwork.length > 1 ? (
                  <>
                    <button 
                      onClick={() => setIsNetworkOpen(!isNetworkOpen)}
                      className="flex items-center gap-1 group mt-0.5 max-w-full text-left"
                    >
                      <span className="text-[10px] font-medium text-accent truncate uppercase tracking-tighter group-hover:text-white transition-colors">
                        {churchName}
                      </span>
                      <ChevronsUpDown className="w-3 h-3 text-accent flex-shrink-0 group-hover:text-white transition-colors" />
                    </button>
                    
                    {/* DROPDOWN GLASSMORPHISM */}
                    {isNetworkOpen && (
                      <div className="absolute bottom-full left-0 mb-2 w-56 rounded-xl border border-white/10 bg-neutral-dark/95 backdrop-blur-xl shadow-2xl z-[100] animate-[fadeIn_0.2s_ease-out] p-2">
                        <div className="text-[10px] uppercase font-bold tracking-widest text-accent mb-2 px-2 pt-1 border-b border-white/5 pb-2">
                          Selecione o Tenant
                        </div>
                        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto no-scrollbar">
                          {churchNetwork.map(net => (
                            <button 
                              key={net.id}
                              onClick={async () => {
                                setIsNetworkOpen(false)
                                const res = await alternarIgrejaAtiva(net.id)
                                if(res?.success) window.location.href = '/dashboard'
                              }}
                              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-all ${
                                net.nome === churchName 
                                ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.05)]' 
                                : 'text-white/80 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              {net.isMatriz ? <Star className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" /> : <Building2 className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />}
                              <span className="truncate">{net.nome}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-[10px] mt-0.5 font-medium text-accent truncate uppercase tracking-tighter">
                    {churchName}
                  </span>
                )}
              </div>
            )}
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })} 
              className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0" 
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}