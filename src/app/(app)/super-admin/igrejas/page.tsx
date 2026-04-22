import { prisma } from "@/lib/prisma"
import { Building2, Search } from "lucide-react"
import { alternarStatusIgreja, acessarIgrejaCliente } from "@/app/actions/superadmin"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function ManageChurchesPage() {
  const user = await getCurrentUser()
  
  if (!user || !user.permissions.includes('*')) {
    redirect('/dashboard')
  }

  const igrejas = await prisma.igreja.findMany({
    orderBy: { nome: 'asc' },
    include: { 
      _count: { select: { usuarios: true } }, 
      usuarios: { where: { is_master: true }, select: { nome: true, email: true } } 
    }
  })

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out]">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <Building2 className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Gerenciar Igrejas</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1 font-medium">Tabela completa de organizações cadastradas</p>
          </div>
        </div>
      </div>

      {/* BLOCO DA TABELA */}
      <div className="rounded-2xl border border-white/10 bg-[#0B1121]/50 backdrop-blur-md shadow-2xl relative overflow-hidden flex flex-col">
        {/* BARRA SUPERIOR E BUSCA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-white/10 relative z-10">
          <div className="relative max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Buscar organização..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-black/20 text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium text-sm"
            />
          </div>
          <div className="text-sm font-medium text-[var(--text-muted)]">
            Total: {igrejas.length} {igrejas.length === 1 ? 'igreja' : 'igrejas'}
          </div>
        </div>

        {/* TABELA */}
        <div className="overflow-x-auto relative z-10 w-full">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10 text-sm font-medium text-[var(--text-muted)] bg-white/[0.01]">
                <th className="py-4 pl-6 font-semibold">ID</th>
                <th className="py-4 font-semibold">Nome da Igreja</th>
                <th className="py-4 font-semibold">Administrador</th>
                <th className="py-4 font-semibold">Usuários</th>
                <th className="py-4 font-semibold">Status</th>
                <th className="py-4 text-right pr-6 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {igrejas.map((igreja) => {
                const master = igreja.usuarios?.[0]
                
                const toggleAction = async () => {
                  "use server"
                  await alternarStatusIgreja(igreja.id, !igreja.ativo)
                }

                return (
                  <tr key={igreja.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="py-4 pl-6 font-mono text-xs text-[var(--text-muted)] tracking-wider">
                      {igreja.id.length < 5 ? `#${igreja.id.padStart(4, '0')}` : `#${igreja.id.slice(1, 9).toUpperCase()}`}
                    </td>
                    <td className="py-4 font-semibold text-white">{igreja.nome}</td>
                    <td className="py-4">
                      {master ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white">{master.nome}</span>
                          <span className="text-xs text-[var(--text-muted)]">{master.email}</span>
                        </div>
                      ) : (
                        <span className="text-sm italic text-[var(--text-muted)]">Sem admin</span>
                      )}
                    </td>
                    <td className="py-4 font-medium text-[var(--text-muted)]">
                      {igreja._count.usuarios}
                    </td>
                    <td className="py-4">
                      {igreja.ativo ? (
                        <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                          Ativa
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                          Bloqueada
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-3 opacity-90 group-hover:opacity-100 transition-opacity">
                        <form action={async () => {
                          "use server"
                          await acessarIgrejaCliente(igreja.id)
                          redirect('/dashboard')
                        }}>
                          <button 
                            type="submit"
                            disabled={!igreja.ativo}
                            className="text-xs px-4 py-2 rounded-lg font-semibold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(59,130,246,0.1)] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                            title="Entrar no painel corporativo desta igreja"
                          >
                            Acessar
                          </button>
                        </form>

                        <form action={toggleAction}>
                          <button 
                            type="submit"
                            className={`text-xs px-4 py-2 rounded-lg font-semibold transition-all shadow-[0_0_10px_rgba(0,0,0,0.1)] hover:shadow-lg ${
                              igreja.ativo 
                              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            }`}
                          >
                            {igreja.ativo ? 'Bloquear' : 'Liberar'}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                )
              })}
              
              {igrejas.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-base text-[var(--text-muted)] font-medium">
                    Nenhuma igreja cadastrada até o momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
