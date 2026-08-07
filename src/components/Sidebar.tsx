'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/ui/Logo'
import {
  LayoutDashboard, ReceiptText, PieChart, Settings, Users,
  LogOut, Key, Menu, ChevronRight, Crown,
  Building2, History, CreditCard, ShieldCheck, ChevronsUpDown, Star,
  BookOpen,
  type LucideIcon
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
  { href: '/super-admin/auditoria', label: 'Auditoria', icon: History },
  { href: '/super-admin/financeiro', label: 'Assinaturas', icon: CreditCard },
  { href: '/super-admin/sistema', label: 'Sistema', icon: BookOpen },
]

const navLinkClass = (isActive: boolean, isMaster: boolean, isCollapsed: boolean) => {
  const active = isMaster
    ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-l-2 border-[var(--color-accent)]'
    : 'bg-[var(--primary-soft)] text-[var(--primary-color)] border-l-2 border-[var(--primary-color)]'
  const inactive = 'text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--color-base-200)] border-l-2 border-transparent'
  const padding = isCollapsed ? 'md:justify-center p-3' : 'px-4 py-3'
  return `flex items-center rounded-lg transition-colors duration-150 ${isActive ? active : inactive} ${padding}`
}

function SidebarSubmenu({
  icon: Icon,
  label,
  isSectionActive,
  isCollapsed,
  isOpen,
  onToggle,
  isMaster,
  children,
}: {
  icon: LucideIcon
  label: string
  isSectionActive: boolean
  isCollapsed: boolean
  isOpen: boolean
  onToggle: () => void
  isMaster: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col">
      <button
        onClick={onToggle}
        className={`justify-between ${navLinkClass(isSectionActive && !isOpen, isMaster, isCollapsed)}`}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className={isCollapsed ? 'md:hidden' : ''}>{label}</span>
        </div>
        <ChevronRight className={`w-4 h-4 transition-transform ${isCollapsed ? 'md:hidden' : ''} ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 flex flex-col gap-1 ${
          !isOpen ? 'max-h-0 opacity-0' : isCollapsed ? 'max-h-64 mt-1 opacity-100 md:max-h-0 md:opacity-0' : 'max-h-64 mt-1 opacity-100'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

export default function Sidebar({
  userPermissions = [],
  userName = '',
  churchName = 'Sua Igreja',
  churchNetwork = [],
  isSupportMode = false
}: {
  userPermissions?: string[],
  userName?: string,
  churchName?: string,
  churchNetwork?: { id: string, nome: string, isMatriz: boolean }[],
  isSupportMode?: boolean
}) {
  const pathname = usePathname()
  const isMasterArea = pathname.startsWith('/super-admin')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [isAuditoriaOpen, setIsAuditoriaOpen] = useState(false)
  const [isSistemaOpen, setIsSistemaOpen] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isNetworkOpen, setIsNetworkOpen] = useState(false)

  const handleLinkClick = () => { if (window.innerWidth < 768) setIsMobileOpen(false) }
  const activeNavItems = isMasterArea ? navItemsMaster : navItemsCliente

  const subLinkClass = (active: boolean) =>
    `pl-12 py-2 text-sm rounded-lg ${
      active
        ? `font-medium ${isMasterArea ? 'text-[var(--color-accent)]' : 'text-[var(--primary-color)]'}`
        : 'text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--color-base-200)]'
    }`

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 sidebar-glass z-[var(--z-sticky)] flex items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <Logo className="w-8 h-8 text-[var(--primary-color)]" />
          <span className="font-serif font-semibold text-xl text-[var(--text-color)] tracking-tight">Church<span className="text-[var(--primary-color)]">Fep</span></span>
        </div>
        <button onClick={() => setIsMobileOpen(true)} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-color)]">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/30 z-[var(--z-sticky)]" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside
        className={`sidebar-glass flex flex-col flex-shrink-0 h-full overflow-hidden transition-all duration-300 z-[var(--z-overlay)] fixed md:relative top-0 left-0 py-8 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'w-64 md:w-24 px-4' : 'w-64 px-6'}`}
      >
        {/* LOGO */}
        <div className={`mb-10 flex items-center min-h-[48px] transition-all duration-300 ${isCollapsed ? 'md:justify-center' : 'justify-start gap-3'}`}>
          <Logo className="w-10 h-10 flex-shrink-0 text-[var(--primary-color)]" />
          <span className={`font-serif font-semibold text-xl text-[var(--text-color)] tracking-tight transition-all duration-300 ${isCollapsed ? 'md:w-0 md:opacity-0 overflow-hidden' : 'opacity-100'}`}>
            Church<span className="text-[var(--primary-color)]">Fep</span>
          </span>
        </div>

        {/* MENU */}
        <nav className="flex flex-col gap-1 flex-1 overflow-x-hidden overflow-y-auto no-scrollbar">
          {activeNavItems.map((item) => {
            if (userPermissions[0] !== '*' && !isMasterArea) {
              const permKey = `${item.href.replace('/', '')}.visualizar`
              if (item.label !== 'Dashboard' && item.label !== 'Configurações' && !userPermissions.includes(permKey)) return null
            }

            const isActive = pathname === item.href || (item.href !== '/super-admin' && pathname.startsWith(item.href))
            const Icon = item.icon

            if (item.label === 'Configurações') {
              return (
                <SidebarSubmenu
                  key={item.href}
                  icon={Icon}
                  label={item.label}
                  isSectionActive={pathname.startsWith('/configuracoes')}
                  isCollapsed={isCollapsed}
                  isOpen={isConfigOpen}
                  isMaster={false}
                  onToggle={() => { if (isCollapsed) setIsCollapsed(false); setIsConfigOpen(!isConfigOpen) }}
                >
                  <Link href="/configuracoes/cultos" onClick={handleLinkClick} className={subLinkClass(pathname.includes('/cultos'))}>Cultos</Link>
                  <Link href="/configuracoes/personalizacao" onClick={handleLinkClick} className={subLinkClass(pathname.includes('/personalizacao'))}>Personalização</Link>
                  <Link href="/configuracoes/changelog" onClick={handleLinkClick} className={subLinkClass(pathname.includes('/changelog'))}>Atualizações</Link>
                </SidebarSubmenu>
              )
            }

            if (item.label === 'Auditoria') {
              return (
                <SidebarSubmenu
                  key={item.href}
                  icon={Icon}
                  label={item.label}
                  isSectionActive={pathname.startsWith('/super-admin/auditoria')}
                  isCollapsed={isCollapsed}
                  isOpen={isAuditoriaOpen}
                  isMaster
                  onToggle={() => { if (isCollapsed) setIsCollapsed(false); setIsAuditoriaOpen(!isAuditoriaOpen) }}
                >
                  <Link href="/super-admin/auditoria/clientes" onClick={handleLinkClick} className={subLinkClass(pathname.includes('/auditoria/clientes'))}>Auditoria Clientes</Link>
                  <Link href="/super-admin/auditoria/master" onClick={handleLinkClick} className={subLinkClass(pathname.includes('/auditoria/master') || pathname === '/super-admin/auditoria')}>Auditoria Super Admin</Link>
                </SidebarSubmenu>
              )
            }

            if (item.label === 'Sistema') {
              return (
                <SidebarSubmenu
                  key={item.href}
                  icon={Icon}
                  label={item.label}
                  isSectionActive={pathname.startsWith('/super-admin/sistema')}
                  isCollapsed={isCollapsed}
                  isOpen={isSistemaOpen}
                  isMaster
                  onToggle={() => { if (isCollapsed) setIsCollapsed(false); setIsSistemaOpen(!isSistemaOpen) }}
                >
                  <Link href="/super-admin/sistema/documentacao" onClick={handleLinkClick} className={subLinkClass(pathname.includes('/sistema/documentacao'))}>Documentação</Link>
                  <Link href="/super-admin/sistema/changelog" onClick={handleLinkClick} className={subLinkClass(pathname.includes('/sistema/changelog'))}>Changelog Interno</Link>
                </SidebarSubmenu>
              )
            }

            return (
              <Link key={item.href} href={item.href} onClick={handleLinkClick} className={navLinkClass(isActive, isMasterArea, isCollapsed)}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className={`truncate ml-3 ${isCollapsed ? 'md:hidden' : ''}`}>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* FOOTER ACTIONS */}
        <div className="mt-auto flex flex-col gap-2">
          <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2' : 'flex-row justify-between'}`}>
            <div className={isCollapsed ? '' : 'flex-1'}>
              {userPermissions[0] === '*' && isSupportMode && !isMasterArea && (
                <form action={sairModoSuporte} className="w-full" onSubmit={handleLinkClick}>
                  <button
                    type="submit"
                    title={isCollapsed ? "Encerrar Suporte" : undefined}
                    className={`flex items-center justify-center rounded-lg transition-colors bg-transparent text-[var(--color-accent)] border border-transparent hover:bg-[var(--color-accent)]/10 hover:border-[var(--color-accent)]/30 ${isCollapsed ? 'p-3' : 'px-5 py-2 text-sm font-medium w-full'}`}
                  >
                    <LogOut className="w-4 h-4 flex-shrink-0 rotate-180" />
                    <span className={`ml-2.5 ${isCollapsed ? 'md:hidden' : ''}`}>Encerrar Suporte</span>
                  </button>
                </form>
              )}

              {userPermissions[0] === '*' && !isSupportMode && !isMasterArea && (
                <Link
                  href="/super-admin"
                  onClick={handleLinkClick}
                  title={isCollapsed ? "Painel Master" : undefined}
                  className={`flex items-center justify-center rounded-lg transition-colors bg-transparent text-[var(--color-accent)] border border-transparent hover:bg-[var(--color-accent)]/10 hover:border-[var(--color-accent)]/30 ${isCollapsed ? 'p-3' : 'px-5 py-2 text-sm font-medium w-full'}`}
                >
                  <Crown className="w-4 h-4 flex-shrink-0" />
                  <span className={`ml-2.5 ${isCollapsed ? 'md:hidden' : ''}`}>Painel Master</span>
                </Link>
              )}
            </div>

            <button
              onClick={() => { setIsCollapsed(!isCollapsed); setIsConfigOpen(false); setIsAuditoriaOpen(false) }}
              className={`hidden md:flex p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--color-base-200)] transition-colors flex-shrink-0 ${isCollapsed ? '' : 'ml-2'}`}
              title={isCollapsed ? "Expandir" : "Recolher"}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* PERFIL E SELETOR DE REDE */}
          <div className={`relative pt-4 border-t border-[var(--border-tint)] flex items-center ${isCollapsed ? 'md:flex-col md:gap-4 md:justify-center' : 'justify-between px-2 md:px-0'}`}>
            <div className={`flex flex-col flex-1 min-w-0 pr-2 relative ${isCollapsed ? 'md:hidden' : ''}`}>
                <span className="text-sm font-semibold text-[var(--text-color)] truncate">{userName}</span>

                {churchNetwork.length > 1 ? (
                  <>
                    <button
                      onClick={() => setIsNetworkOpen(!isNetworkOpen)}
                      className="flex items-center gap-1 group mt-0.5 max-w-full text-left"
                    >
                      <span className="text-xs font-medium text-[var(--primary-color)] truncate uppercase tracking-tight">
                        {churchName}
                      </span>
                      <ChevronsUpDown className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0 group-hover:text-[var(--text-color)] transition-colors" />
                    </button>

                    {isNetworkOpen && (
                      <div className="absolute bottom-full left-0 mb-2 w-56 rounded-[var(--radius-box)] border border-[var(--color-base-300)] bg-[var(--color-base-100)] shadow-[var(--shadow-lg)] z-[var(--z-dropdown)] p-2">
                        <div className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] mb-2 px-2 pt-1 border-b border-[var(--border-tint)] pb-2">
                          Selecione o Tenant
                        </div>
                        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto no-scrollbar">
                          {churchNetwork.map(net => (
                            <button
                              key={net.id}
                              onClick={async () => {
                                setIsNetworkOpen(false)
                                const res = await alternarIgrejaAtiva(net.id)
                                if (res?.success) window.location.href = '/dashboard'
                              }}
                              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors ${
                                net.nome === churchName
                                  ? 'bg-[var(--primary-soft)] text-[var(--primary-color)]'
                                  : 'text-[var(--text-muted)] hover:bg-[var(--color-base-200)] hover:text-[var(--text-color)]'
                              }`}
                            >
                              {net.isMatriz ? <Star className="w-3.5 h-3.5 text-[var(--primary-color)] flex-shrink-0" /> : <Building2 className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />}
                              <span className="truncate">{net.nome}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-xs mt-0.5 font-medium text-[var(--primary-color)] truncate uppercase tracking-tight">
                    {churchName}
                  </span>
                )}
              </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-2 rounded-lg text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors flex-shrink-0"
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
