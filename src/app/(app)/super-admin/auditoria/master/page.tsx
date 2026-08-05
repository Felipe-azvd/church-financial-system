import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { History, User, Building2 } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AuditoriaMasterPage() {
  const user = await getCurrentUser()

  if (!user || !user.permissions.includes('*')) {
    redirect('/dashboard')
  }

  const logs = await prisma.logAuditoria.findMany({
    include: {
      usuario: { select: { nome: true, email: true, role: true } },
      igreja: { select: { nome: true } },
    },
    orderBy: { criado_em: 'desc' },
    take: 100
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold tracking-tight flex items-center gap-3">
          <History className="w-6 h-6 text-[var(--color-accent)]" />
          Auditoria Super Admin
        </h1>
        <p className="text-[var(--text-muted)] mt-2 text-sm">Histórico global de operações críticas e ações de suporte.</p>
      </div>

      <div className="rounded-[var(--radius-box)] border border-[var(--color-base-300)] bg-[var(--color-base-100)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="overflow-x-auto md:overflow-visible">
          <table className="w-full text-left border-collapse block md:table md:min-w-[800px]">
            <thead className="hidden md:table-header-group">
              <tr className="bg-[var(--color-base-200)] border-b border-[var(--color-base-300)]">
                <th className="p-4 text-xs font-bold uppercase tracking-wider">Data / Hora</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider">Usuário</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider">Igreja</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider">Ação</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider">Descrição</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group">
              {logs.length === 0 ? (
                <tr className="block md:table-row"><td colSpan={5} className="block md:table-cell p-10 text-center text-[var(--text-muted)]">Nenhum log registado.</td></tr>
              ) : (
                logs.map((log) => {
                  const isMasterAction = log.usuario.email === 'felipeabreu.1994@gmail.com'
                  return (
                    <tr key={log.id} className="flex flex-col bg-transparent py-4 border-b border-[var(--color-base-300)] last:border-b-0 md:table-row md:py-0 md:hover:bg-[var(--color-base-200)] transition-colors">
                      <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:p-4 text-sm text-[var(--text-muted)]">
                        <span className="md:hidden font-bold text-[var(--text-muted)] text-xs uppercase tracking-wider">Data / Hora</span>
                        <span>{format(log.criado_em, "dd/MM/yy HH:mm", { locale: ptBR })}</span>
                      </td>
                      <td className="flex justify-between items-center gap-3 py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:p-4">
                        <span className="md:hidden font-bold text-[var(--text-muted)] text-xs uppercase tracking-wider flex-shrink-0">Usuário</span>
                        <div className="flex items-center gap-2 min-w-0">
                          <User size={14} className={`flex-shrink-0 ${isMasterAction ? "text-[var(--color-accent)]" : "text-[var(--text-muted)]"}`} />
                          <span className={`text-sm font-medium truncate ${isMasterAction ? "text-[var(--color-accent)]" : ""}`}>
                            {log.usuario.nome}
                          </span>
                        </div>
                      </td>
                      <td className="flex justify-between items-center gap-3 py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:p-4 text-sm text-[var(--text-muted)]">
                        <span className="md:hidden font-bold text-[var(--text-muted)] text-xs uppercase tracking-wider flex-shrink-0">Igreja</span>
                        <div className="flex items-center gap-2 min-w-0">
                          <Building2 size={14} className="opacity-60 flex-shrink-0" /> <span className="truncate">{log.igreja.nome}</span>
                        </div>
                      </td>
                      <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:p-4">
                        <span className="md:hidden font-bold text-[var(--text-muted)] text-xs uppercase tracking-wider">Ação</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          isMasterAction ? "border-[var(--color-accent)]/30 text-[var(--color-accent)] bg-[var(--color-accent)]/5" : "border-[var(--color-base-300)] bg-[var(--color-base-200)]"
                        }`}>
                          {log.acao}
                        </span>
                      </td>
                      <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:p-4 text-sm text-[var(--text-muted)] md:max-w-[300px] md:truncate text-right md:text-left" title={log.descricao}>
                        <span className="md:hidden font-bold text-[var(--text-muted)] text-xs uppercase tracking-wider">Descrição</span>
                        <span>{log.descricao}</span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
