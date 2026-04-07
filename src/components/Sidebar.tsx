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

export default function Sidebar({ userPermissions = [], userName = '' }: { userPermissions?: string[], userName?: string }) {
  const pathname = usePathname()

  return (
    <aside className="sidebar-glass flex flex-col w-64 flex-shrink-0 h-full overflow-y-auto px-5 py-8 gap-2">
      <div className="mb-10 flex items-center gap-3">
        <span className="text-2xl font-bold logo-glow">
          ChurchFin
        </span>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
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
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between">
        <span className="text-sm font-medium text-white opacity-70">
          {userName}
        </span>
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
          title="Sair"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </aside>
  )
}
