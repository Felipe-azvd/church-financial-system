'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ReceiptText, PieChart, Settings, Users, LogOut, Key } from 'lucide-react'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/lancamentos', label: 'Lançamentos', icon: ReceiptText },
  { href: '/relatorios', label: 'Relatórios', icon: PieChart },
  { href: '/usuarios', label: 'Usuários', icon: Users },
  { href: '/funcoes', label: 'Funções', icon: Key },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export default function Sidebar({ userPermissions = [] }: { userPermissions?: string[] }) {
  const pathname = usePathname()

  return (
    <aside className="sidebar glass">
      <div className="sidebar-header">
        <div className="logo-placeholder">CF</div>
        <span className="logo-text">ChurchFin</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          if (item.label === 'Dashboard' && !userPermissions.includes('dashboard.visualizar')) return null
          if (item.label === 'Lançamentos' && !userPermissions.includes('lancamentos.visualizar')) return null
          if (item.label === 'Relatórios' && !userPermissions.includes('relatorios.visualizar')) return null
          if (item.label === 'Usuários' && !userPermissions.includes('usuarios.visualizar')) return null
          if (item.label === 'Funções' && !userPermissions.includes('funcoes.visualizar')) return null
          if (item.label === 'Configurações' && !userPermissions.includes('configuracoes.visualizar')) return null

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

      <div className="sidebar-footer">
        <button 
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors font-medium text-base cursor-pointer text-[var(--danger)] hover:bg-[var(--danger)] hover:bg-opacity-10 active:bg-opacity-20"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>Sair</span>
        </button>
      </div>

      <style jsx>{`
        .sidebar {
          width: 260px;
          height: 100vh;
          background-color: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
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
