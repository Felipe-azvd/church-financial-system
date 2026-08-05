import { prisma } from "@/lib/prisma"
import { Building2, CheckCircle2, AlertCircle, Check, DollarSign } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import EditPlanModal from "@/components/EditPlanModal"

export default async function FinancialSubscriptionsPage() {
  const user = await getCurrentUser()

  if (!user || !user.permissions.includes('*')) {
    redirect('/dashboard')
  }

  const igrejas = await prisma.igreja.findMany({
    orderBy: { dia_vencimento: 'asc' }
  })

  const clientesAtivos = igrejas.filter(i => i.ativo).length
  const emDia = igrejas.filter(i => i.status_pagamento === "EM_DIA").length
  const inadimplencia = igrejas.filter(i => i.status_pagamento === "ATRASADO").length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 rounded-[var(--radius-field)] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30">
          <DollarSign className="w-6 h-6 text-[var(--color-accent)]" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-semibold tracking-tight">Gestão de Assinaturas</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Controle financeiro e mensalidades das organizações</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-2">
        <div className="metric-card p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Clientes Ativos</p>
            <h3 className="text-2xl font-bold tabular-nums mt-1">{clientesAtivos}</h3>
          </div>
        </div>

        <div className="metric-card p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 text-[var(--color-success)] flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Assinaturas em Dia</p>
            <h3 className="text-2xl font-bold tabular-nums mt-1">{emDia}</h3>
          </div>
        </div>

        <div className="metric-card p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)] flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Inadimplência</p>
            <h3 className="text-2xl font-bold tabular-nums mt-1">{inadimplencia}</h3>
          </div>
        </div>
      </div>

      <div className="rounded-[var(--radius-box)] border border-[var(--color-base-300)] bg-[var(--color-base-100)] shadow-[var(--shadow-sm)] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-[var(--color-base-300)]">
          <h2 className="text-lg font-semibold">Controle de Mensalidades</h2>
        </div>

        <div className="overflow-x-auto md:overflow-visible w-full max-md:px-4">
          <table className="w-full text-left border-collapse block md:table md:min-w-[700px]">
            <thead className="hidden md:table-header-group">
              <tr className="border-b border-[var(--color-base-300)] text-sm font-medium text-[var(--text-muted)]">
                <th className="py-4 pl-6 font-semibold">Igreja</th>
                <th className="py-4 font-semibold">Plano</th>
                <th className="py-4 font-semibold">Vencimento</th>
                <th className="py-4 font-semibold">Status</th>
                <th className="py-4 text-right pr-6 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group text-sm">
              {igrejas.map((igreja) => {

                let statusBadgeClasses = ""
                let statusText = igreja.status_pagamento || "PENDENTE"

                if (statusText === "EM_DIA") {
                  statusBadgeClasses = "bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20"
                  statusText = "Em Dia"
                } else if (statusText === "ATRASADO") {
                  statusBadgeClasses = "bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20"
                  statusText = "Atrasado"
                } else {
                  statusBadgeClasses = "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20"
                  statusText = "Pendente"
                }

                return (
                  <tr key={igreja.id} className="flex flex-col bg-transparent py-4 border-b border-[var(--color-base-300)] last:border-b-0 md:table-row md:py-0 md:hover:bg-[var(--color-base-200)] transition-colors group">
                    <td className="flex justify-between items-center gap-3 py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4 md:pl-6 font-semibold">
                      <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs flex-shrink-0">Igreja</span>
                      <span className="truncate min-w-0 text-right md:text-left">{igreja.nome}</span>
                    </td>
                    <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4">
                      <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Plano</span>
                      {igreja.plano ? (
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--color-base-200)] border border-[var(--color-base-300)] text-[var(--text-muted)] uppercase tracking-wider">
                          {igreja.plano}
                        </span>
                      ) : (
                        <span className="text-xs italic text-[var(--text-muted)]">Sem plano</span>
                      )}
                    </td>
                    <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4 font-medium text-[var(--text-muted)]">
                      <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Vencimento</span>
                      <span>{igreja.dia_vencimento ? `Dia ${igreja.dia_vencimento}` : '--'}</span>
                    </td>
                    <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4">
                      <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Status</span>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusBadgeClasses}`}>
                        {statusText}
                      </span>
                    </td>
                    <td className="flex flex-col gap-2 py-4 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4 md:text-right md:pr-6">
                      <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Ações</span>
                      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:justify-end">
                        <EditPlanModal
                          igrejaId={igreja.id}
                          currentPlan={igreja.plano}
                          currentVencimento={igreja.dia_vencimento}
                        />
                        <button
                          className="flex items-center justify-center gap-2 text-xs px-4 py-2 rounded-[var(--radius-field)] font-semibold bg-transparent border border-[var(--color-success)]/30 text-[var(--color-success)] hover:bg-[var(--color-success)]/10 transition-colors w-full md:w-auto"
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
