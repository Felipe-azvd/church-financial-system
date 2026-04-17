import { prisma } from "@/lib/prisma"
import { Crown, Building2, Users } from "lucide-react"
import NewChurchButton from "@/components/NewChurchButton"
import { alternarStatusIgreja, acessarIgrejaCliente } from "@/app/actions/superadmin"
import { getCurrentUser } from "@/lib/auth" // 🔥 Adicionado
import { redirect } from "next/navigation"  // 🔥 Adicionado

export default async function SuperAdminPage() {
  const user = await getCurrentUser()
  
  // 🔥 O Leão de Chácara: Se não tiver o asterisco, é chutado para o dashboard comum
  if (!user || !user.permissions.includes('*')) {
    redirect('/dashboard')
  }

  const igrejas = await prisma.igreja.findMany({
    orderBy: { data_criacao: 'desc' }
  })
  
  const totalUsuarios = await prisma.usuario.count()

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out]">
      
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <Crown className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Painel Super Admin</h1>
          <p className="text-sm text-amber-500/80 mt-1 font-medium">Controle global da plataforma</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
        <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md p-6 shadow-xl flex items-center gap-5">
          <div className="p-4 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider">Igrejas Ativas</p>
            <h3 className="text-3xl font-bold text-white mt-1">{igrejas.filter(i => i.ativo).length}</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md p-6 shadow-xl flex items-center gap-5">
          <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider">Usuários Globais</p>
            <h3 className="text-3xl font-bold text-white mt-1">{totalUsuarios}</h3>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0B1121]/50 backdrop-blur-md p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-6 relative z-10">
          <h2 className="text-lg font-semibold text-white">Organizações Cadastradas</h2>
          <NewChurchButton />
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-sm font-medium text-[var(--text-muted)]">
                <th className="pb-3 pl-2">ID</th>
                <th className="pb-3">Nome da Igreja</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-2">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {igrejas.map((igreja) => {

                // Prepara a ação do formulário com os parâmetros corretos
                const toggleAction = async (formData: FormData) => {
                  "use server"
                  await alternarStatusIgreja(igreja.id, !igreja.ativo)
                }

                return (
                  <tr key={igreja.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="py-4 pl-2 font-mono text-xs text-[var(--text-muted)] tracking-wider">
                      {igreja.id.length < 5 ? `#${igreja.id.padStart(4, '0')}` : `#${igreja.id.slice(1, 9).toUpperCase()}`}
                    </td>
                    <td className="py-4 font-semibold text-white">{igreja.nome}</td>
                    <td className="py-4">
                      {igreja.ativo ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Ativo
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                          Bloqueada
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right pr-2">
                      <div className="flex items-center justify-end gap-2">
                        <form action={async () => {
                          "use server"
                            await acessarIgrejaCliente(igreja.id)
                            redirect('/dashboard') // Redireciona na hora pro dashboard do cliente
                        }}>
                          <button 
                              type="submit"
                              disabled={!igreja.ativo}
                              className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Entrar no painel desta igreja"
                            >
                              Acessar
                          </button>
                        </form>

                        <form action={toggleAction}>
                          <button 
                            type="submit"
                            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                              igreja.ativo 
                              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
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
                  <td colSpan={4} className="py-8 text-center text-[var(--text-muted)]">
                    Nenhuma igreja encontrada. Adicione a primeira!
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