import { prisma } from "@/lib/prisma"
import { Building2, CheckCircle2, AlertCircle, Check, DollarSign } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import EditPlanModal from "@/components/EditPlanModal"

export default async function FinancialSubscriptionsPage() {
  const user = await getCurrentUser()
  
  // 🔥 O Leão de Chácara: Se não tiver o asterisco, é chutado para o dashboard comum
  if (!user || !user.permissions.includes('*')) {
    redirect('/dashboard')
  }

  // Busca todas as igrejas ordenando pelo dia de vencimento
  const igrejas = await prisma.igreja.findMany({
    orderBy: { dia_vencimento: 'asc' }
  })

  // Cálculos para os Cards
  const clientesAtivos = igrejas.filter(i => i.ativo).length
  const emDia = igrejas.filter(i => i.status_pagamento === "EM_DIA").length
  const inadimplencia = igrejas.filter(i => i.status_pagamento === "ATRASADO").length

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out]">
      {/* CABEÇALHO */}
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <DollarSign className="w-6 h-6 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Gestão de Assinaturas</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1 font-medium">Controle financeiro e mensalidades das organizações</p>
        </div>
      </div>

      {/* BLOCO DE INDICADORES (Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-2">
        {/* Card 1: CLIENTES ATIVOS */}
        <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md p-6 shadow-xl flex items-center gap-5 hover:bg-white/[0.02] transition-colors">
          <div className="p-4 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider text-xs">Clientes Ativos</p>
            <h3 className="text-3xl font-bold text-white mt-1">{clientesAtivos}</h3>
          </div>
        </div>

        {/* Card 2: ASSINATURAS EM DIA */}
        <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md p-6 shadow-xl flex items-center gap-5 hover:bg-white/[0.02] transition-colors">
          <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider text-xs">Assinaturas em Dia</p>
            <h3 className="text-3xl font-bold text-white mt-1">{emDia}</h3>
          </div>
        </div>

        {/* Card 3: INADIMPLÊNCIA */}
        <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md p-6 shadow-xl flex items-center gap-5 hover:bg-white/[0.02] transition-colors">
          <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider text-xs">Inadimplência</p>
            <h3 className="text-3xl font-bold text-white mt-1">{inadimplencia}</h3>
          </div>
        </div>
      </div>

      {/* BLOCO DA TABELA DE CONTROLE DE MENSALIDADES */}
      <div className="rounded-2xl border border-white/10 bg-[#0B1121]/50 backdrop-blur-md shadow-2xl relative overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/10 relative z-10">
          <h2 className="text-lg font-semibold text-white">Controle de Mensalidades</h2>
        </div>

        <div className="overflow-x-auto md:overflow-visible relative z-10 w-full">
          <table className="w-full text-left border-collapse block md:table md:min-w-[700px]">
            <thead className="hidden md:table-header-group">
              <tr className="border-b border-white/10 text-sm font-medium text-[var(--text-muted)] bg-white/[0.01]">
                <th className="py-4 pl-6 font-semibold">Igreja</th>
                <th className="py-4 font-semibold">Plano</th>
                <th className="py-4 font-semibold">Vencimento</th>
                <th className="py-4 font-semibold">Status</th>
                <th className="py-4 text-right pr-6 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group text-sm">
              {igrejas.map((igreja) => {
                
                // Formatação das Cores/Bordas para Status
                let statusBadgeClasses = ""
                let statusText = igreja.status_pagamento || "PENDENTE"
                
                if (statusText === "EM_DIA") {
                  statusBadgeClasses = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                  statusText = "Em Dia"
                } else if (statusText === "ATRASADO") {
                  statusBadgeClasses = "bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                  statusText = "Atrasado"
                } else {
                  // PENDENTE
                  statusBadgeClasses = "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                  statusText = "Pendente"
                }

                return (
                  <tr key={igreja.id} className="flex flex-col mb-4 border border-white/10 rounded-xl p-4 bg-white/[0.02] md:bg-transparent shadow-sm md:table-row md:mb-0 md:border-b md:border-white/5 md:p-0 md:shadow-none hover:bg-white/[0.04] md:hover:bg-white/[0.02] transition-colors group">
                    <td className="flex justify-between items-center py-2 border-b border-white/5 last:border-b-0 md:table-cell md:border-none md:py-4 md:pl-6 font-semibold text-white">
                      <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Igreja</span>
                      <span>{igreja.nome}</span>
                    </td>
                    <td className="flex justify-between items-center py-2 border-b border-white/5 last:border-b-0 md:table-cell md:border-none md:py-4">
                      <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Plano</span>
                      {igreja.plano ? (
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/5 border border-white/10 text-[var(--text-muted)] uppercase tracking-wider">
                          {igreja.plano}
                        </span>
                      ) : (
                        <span className="text-xs italic text-white/30">Sem plano</span>
                      )}
                    </td>
                    <td className="flex justify-between items-center py-2 border-b border-white/5 last:border-b-0 md:table-cell md:border-none md:py-4 font-medium text-[var(--text-muted)]">
                      <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Vencimento</span>
                      <span>{igreja.dia_vencimento ? `Dia ${igreja.dia_vencimento}` : '--'}</span>
                    </td>
                    <td className="flex justify-between items-center py-2 border-b border-white/5 last:border-b-0 md:table-cell md:border-none md:py-4">
                      <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Status</span>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusBadgeClasses}`}>
                        {statusText}
                      </span>
                    </td>
                    <td className="flex justify-between items-center py-4 border-b border-white/5 last:border-b-0 md:table-cell md:border-none md:py-4 md:text-right md:pr-6">
                      <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Ações</span>
                      <div className="flex items-center justify-end gap-3 opacity-100 md:opacity-90 md:group-hover:opacity-100 transition-opacity">
                        <EditPlanModal 
                          igrejaId={igreja.id} 
                          currentPlan={igreja.plano} 
                          currentVencimento={igreja.dia_vencimento} 
                        />
                        <button 
                          className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg font-semibold bg-transparent border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-all shadow-[0_0_10px_rgba(16,185,129,0.05)] hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                          title="Marcar como Paga"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Registrar Pagamento
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              
              {igrejas.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-base text-[var(--text-muted)] font-medium">
                    Nenhuma igreja encontrada no banco de dados.
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
