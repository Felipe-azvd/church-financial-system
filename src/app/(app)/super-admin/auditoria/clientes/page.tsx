import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Users, Building2 } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AuditoriaClientesPage() {
  const user = await getCurrentUser()

  if (!user || !user.permissions.includes('*')) {
    redirect('/dashboard')
  }

  const logs = await prisma.logAuditoria.findMany({
    where: {
      igreja: { nome: { not: 'Ministério Sol da Justiça' } }
    },
    include: {
      usuario: { select: { nome: true } },
      igreja: { select: { nome: true } },
    },
    orderBy: { criado_em: 'desc' },
    take: 100
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold tracking-tight flex items-center gap-3">
          <Users className="w-6 h-6 text-[var(--color-accent)]" />
          Auditoria de Clientes
        </h1>
        <p className="text-[var(--text-muted)] mt-2 text-sm">Monitorização de atividades em igrejas tenant.</p>
      </div>

      <div className="rounded-[var(--radius-box)] border border-[var(--color-base-300)] bg-[var(--color-base-100)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="overflow-x-auto md:overflow-visible">
          <table className="w-full text-left border-collapse block md:table md:min-w-[800px]">
            <thead className="hidden md:table-header-group">
              <tr className="bg-[var(--color-base-200)] border-b border-[var(--color-base-300)]">
                <th className="p-4 text-xs font-bold uppercase tracking-wider">Data</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider">Igreja</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider">Usuário</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider">Ação</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider">Descrição</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group">
              {logs.length === 0 ? (
                <tr className="block md:table-row"><td colSpan={5} className="block md:table-cell p-10 text-center text-[var(--text-muted)]">Nenhuma atividade de cliente registada.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="flex flex-col bg-transparent py-4 border-b border-[var(--color-base-300)] last:border-b-0 md:table-row md:py-0 md:hover:bg-[var(--color-base-200)] transition-colors">
                    <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:p-4 text-sm text-[var(--text-muted)]">
                      <span className="md:hidden font-bold text-[var(--text-muted)] text-xs uppercase tracking-wider">Data</span>
                      <span>{format(log.criado_em, "dd/MM HH:mm", { locale: ptBR })}</span>
                    </td>
                    <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:p-4 text-sm font-semibold">
                      <span className="md:hidden font-bold text-[var(--text-muted)] text-xs uppercase tracking-wider">Igreja</span>
                      <div className="flex items-center gap-2 text-[var(--color-accent)]">
                        <Building2 size={14} /> {log.igreja.nome}
                      </div>
                    </td>
                    <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:p-4 text-sm text-[var(--text-muted)]">
                      <span className="md:hidden font-bold text-[var(--text-muted)] text-xs uppercase tracking-wider">Usuário</span>
                      <span>{log.usuario.nome}</span>
                    </td>
                    <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:p-4">
                      <span className="md:hidden font-bold text-[var(--text-muted)] text-xs uppercase tracking-wider">Ação</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-[var(--color-base-300)] bg-[var(--color-base-200)]">
                        {log.acao}
                      </span>
                    </td>
                    <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:p-4 text-sm text-[var(--text-muted)] md:max-w-[250px] md:truncate text-right md:text-left">
                      <span className="md:hidden font-bold text-[var(--text-muted)] text-xs uppercase tracking-wider">Descrição</span>
                      <span>{log.descricao}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
