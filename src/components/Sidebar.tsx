'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ReceiptText, PieChart, Settings, Users, LogOut, Key, Sun, Moon } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/lancamentos', label: 'Lançamentos', icon: ReceiptText },
  { href: '/relatorios', label: 'Relatórios', icon: PieChart },
  { href: '/usuarios', label: 'Usuários', icon: Users },
  { href: '/funcoes', label: 'Funções', icon: Key },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export default function Sidebar({ userPermissions = [], userName = '' }: { userPermissions?: string[], userName?: string }) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <aside className="sidebar glass flex justify-between flex-col w-64 flex-shrink-0 h-full overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-[var(--bg-secondary)]">
      <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <div className="logo-placeholder">CF</div>
          <span className="logo-text">ChurchFin</span>
        </div>
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors"
            title="Alternar Tema"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[var(--warning)]" /> : <Moon className="w-4 h-4 text-[var(--text-primary)]" />}
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          // 🔥 O CORINGA: Se for MASTER, o primeiro item é "*", então ele pula a verificação normal
          const isMaster = userPermissions[0] === '*';

          if (!isMaster) {
            if (item.label === 'Dashboard' && !userPermissions.includes('dashboard.visualizar')) return null
            if (item.label === 'Lançamentos' && !userPermissions.includes('lancamentos.visualizar')) return null
            if (item.label === 'Relatórios' && !userPermissions.includes('relatorios.visualizar')) return null
            if (item.label === 'Usuários' && !userPermissions.includes('usuarios.visualizar')) return null
            if (item.label === 'Funções' && !userPermissions.includes('funcoes.visualizar')) return null
            if (item.label === 'Configurações' && !userPermissions.includes('configuracoes.visualizar')) return null
          }

          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors font-medium text-base cursor-pointer nav-item ${
                isActive
                  ? 'nav-item-active text-[var(--accent-primary)] glow glow-hover'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] active:bg-base-300'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'}`} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="sidebar-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="user-name" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>
          {userName}
        </span>
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="p-2 rounded-lg text-[var(--danger)] hover:bg-[var(--danger)] hover:bg-opacity-10 transition-colors"
          title="Sair"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <style jsx>{`
        .sidebar {
          /* Estilos flex agora controlados pelo Tailwind */
        }

        .sidebar-header {
          padding: var(--spacing-lg);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          border-bottom: 1px solid var(--border-color);
        }

        .logo-placeholder {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-hover));
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: var(--text-lg);
        }

        .logo-text {
          font-weight: 600;
          font-size: var(--text-xl);
          color: var(--text-primary);
        }

        .sidebar-nav {
          padding: var(--spacing-md);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
          flex: 1;
        }

        .nav-icon {
          color: var(--text-muted);
          transition: color 0.2s;
        }

        .nav-item {
          border-left: 3px solid transparent;
        }

        .nav-item-active {
          background: linear-gradient(90deg, rgba(var(--primary-rgb), 0.2), transparent);
          border-left: 3px solid rgb(var(--primary));
          text-shadow: 0 0 10px rgba(var(--primary-rgb), 0.5);
        }

        .sidebar-footer {
          padding: var(--spacing-md);
          border-top: 1px solid var(--border-color);
        }
      `}</style>
    </aside>
  )
}
