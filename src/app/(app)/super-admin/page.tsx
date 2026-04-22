import { prisma } from "@/lib/prisma"
import { Crown, Building2, Users, Calendar, LineChart } from "lucide-react"
import NewChurchButton from "@/components/NewChurchButton"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function SuperAdminPage() {
  const user = await getCurrentUser()
  
  // 🔥 O Leão de Chácara: Se não tiver o asterisco, é chutado para o dashboard comum
  if (!user || !user.permissions.includes('*')) {
    redirect('/dashboard')
  }

  const totaisAtivas = await prisma.igreja.count({ where: { ativo: true } })
  const totalUsuarios = await prisma.usuario.count()

  const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const igrejasUltimos30Dias = await prisma.igreja.count({ 
    where: { data_criacao: { gte: trintaDiasAtras } } 
  })
  
  const mediaUsuarios = totaisAtivas > 0 ? Math.round(totalUsuarios / totaisAtivas) : 0

  const ultimasIgrejas = await prisma.igreja.findMany({
    orderBy: { data_criacao: 'desc' },
    take: 5,
    include: { 
      usuarios: { 
        where: { is_master: true }, 
        select: { nome: true } 
      } 
    }
  })
  
  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out]">
      
      {/* CABEÇALHO */}
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <Crown className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Painel Super Admin</h1>
          <p className="text-sm text-amber-500/80 mt-1 font-medium">Controle global da plataforma</p>
        </div>
      </div>

      {/* BLOCO 1: Indicadores Principais */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Indicadores Principais</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md p-6 shadow-xl flex items-center gap-5 hover:bg-white/[0.02] transition-colors">
            <div className="p-4 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider text-xs">Igrejas Ativas</p>
              <h3 className="text-3xl font-bold text-white mt-1">{totaisAtivas}</h3>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md p-6 shadow-xl flex items-center gap-5 hover:bg-white/[0.02] transition-colors">
            <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider text-xs">Usuários Globais</p>
              <h3 className="text-3xl font-bold text-white mt-1">{totalUsuarios}</h3>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md p-6 shadow-xl flex items-center gap-5 hover:bg-white/[0.02] transition-colors">
            <div className="p-4 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider text-xs">Novas Igrejas (30d)</p>
              <h3 className="text-3xl font-bold text-white mt-1">{igrejasUltimos30Dias}</h3>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md p-6 shadow-xl flex items-center gap-5 hover:bg-white/[0.02] transition-colors">
            <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <LineChart className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider text-xs">Média Usuários/Igreja</p>
              <h3 className="text-3xl font-bold text-white mt-1">{mediaUsuarios}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* BLOCO: Crescimento da Plataforma (Gráfico Nativo) */}
      <div className="rounded-2xl border border-white/10 bg-[#0B1121]/50 backdrop-blur-md p-6 shadow-2xl relative overflow-hidden">
        <h2 className="text-lg font-semibold text-white mb-6">Crescimento da Plataforma</h2>
        
        <div className="flex items-end justify-between sm:justify-around h-48 pt-4 pb-2 border-b border-white/10 relative">
          
          {/* Linhas de grade (opcional, visual) */}
          <div className="absolute inset-x-0 bottom-1/2 border-b border-white/5 w-full pointer-events-none"></div>
          <div className="absolute inset-x-0 top-0 border-b border-white/5 w-full pointer-events-none"></div>

          {/* Barras do Gráfico */}
          <div className="flex flex-col items-center gap-2 z-10 w-1/6">
            <div className="w-full max-w-[40px] bg-amber-500/80 hover:bg-amber-400 transition-colors rounded-t-lg h-[30%]"></div>
            <span className="text-xs text-[var(--text-muted)] mt-1">M1</span>
          </div>
          <div className="flex flex-col items-center gap-2 z-10 w-1/6">
            <div className="w-full max-w-[40px] bg-amber-500/80 hover:bg-amber-400 transition-colors rounded-t-lg h-[45%]"></div>
            <span className="text-xs text-[var(--text-muted)] mt-1">M2</span>
          </div>
          <div className="flex flex-col items-center gap-2 z-10 w-1/6">
            <div className="w-full max-w-[40px] bg-amber-500/80 hover:bg-amber-400 transition-colors rounded-t-lg h-[60%]"></div>
            <span className="text-xs text-[var(--text-muted)] mt-1">M3</span>
          </div>
          <div className="flex flex-col items-center gap-2 z-10 w-1/6">
            <div className="w-full max-w-[40px] bg-amber-500/80 hover:bg-amber-400 transition-colors rounded-t-lg h-[75%]"></div>
            <span className="text-xs text-[var(--text-muted)] mt-1">M4</span>
          </div>
          <div className="flex flex-col items-center gap-2 z-10 w-1/6">
            <div className="w-full max-w-[40px] bg-amber-500/80 hover:bg-amber-400 transition-colors rounded-t-lg h-[90%]"></div>
            <span className="text-xs text-[var(--text-muted)] mt-1">M5</span>
          </div>
          <div className="flex flex-col items-center gap-2 z-10 w-1/6">
            <div className="w-full max-w-[40px] bg-amber-500/90 hover:bg-amber-400 transition-colors rounded-t-lg h-[100%] shadow-[0_0_15px_rgba(245,158,11,0.4)]"></div>
            <span className="text-xs text-[var(--text-muted)] font-semibold text-amber-500 mt-1">Atual</span>
          </div>
        </div>
      </div>

      {/* BLOCO 2: Igrejas Cadastradas Recentemente */}
      <div className="rounded-2xl border border-white/10 bg-[#0B1121]/50 backdrop-blur-md p-6 shadow-2xl relative overflow-hidden mt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
          <h2 className="text-lg font-semibold text-white">Igrejas Cadastradas Recentemente</h2>
          <div className="flex items-center gap-4">
            <Link 
              href="/super-admin/igrejas" 
              className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wide"
            >
              Ver Tabela Completa
            </Link>
            <NewChurchButton />
          </div>
        </div>

        <div className="flex flex-col gap-3 relative z-10">
          {ultimasIgrejas.map((igreja) => {
            const masterName = igreja.usuarios?.[0]?.nome

            return (
            <div key={igreja.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors gap-4">
              <div>
                <h4 className="text-base font-semibold text-white">{igreja.nome}</h4>
                {masterName && (
                  <p className="text-xs font-medium text-amber-500/90 mt-0.5">Admin: {masterName}</p>
                )}
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Criada em {new Intl.DateTimeFormat('pt-BR').format(igreja.data_criacao)}
                </p>
              </div>
              <div>
                {igreja.ativo ? (
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Ativa
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                    Bloqueada
                  </span>
                )}
              </div>
            </div>
          )})}
          
          {ultimasIgrejas.length === 0 && (
            <div className="py-8 text-center text-[var(--text-muted)]">
              Nenhuma igreja encontrada. Adicione a primeira!
            </div>
          )}
        </div>
      </div>
      
    </div>
  )
}