import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { History, User, Building2 } from "lucide-react"

export default async function AuditoriaMasterPage() {
  const logs = await prisma.logAuditoria.findMany({
    include: {
      usuario: { select: { nome: true, email: true, role: true } },
      igreja: { select: { nome: true } },
    },
    orderBy: { criado_em: 'desc' },
    take: 100
  })

  return (
    <div className="p-8 space-y-8 animate-[fadeIn_0.3s_ease-out]">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <History className="text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]" /> 
          Auditoria Super Admin
        </h1>
        <p className="text-[var(--text-muted)] mt-2 italic">Histórico global de operações críticas e ações de suporte.</p>
      </div>

      <div className="rounded-2xl border border-[var(--border-tint)] bg-[var(--surface-tint)] overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="p-4 text-xs font-bold text-white uppercase tracking-wider">Data / Hora</th>
                <th className="p-4 text-xs font-bold text-white uppercase tracking-wider">Usuário</th>
                <th className="p-4 text-xs font-bold text-white uppercase tracking-wider">Igreja</th>
                <th className="p-4 text-xs font-bold text-white uppercase tracking-wider">Ação</th>
                <th className="p-4 text-xs font-bold text-white uppercase tracking-wider">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-[var(--text-muted)]">Nenhum log registado.</td></tr>
              ) : (
                logs.map((log) => {
                  const isMasterAction = log.usuario.email === 'felipeabreu.1994@gmail.com'
                  return (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 text-sm text-[var(--text-muted)]">
                        {format(log.criado_em, "dd/MM/yy HH:mm", { locale: ptBR })}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User size={14} className={isMasterAction ? "text-amber-500" : "text-emerald-500"} />
                          <span className={`text-sm font-medium ${isMasterAction ? "text-amber-400" : "text-white"}`}>
                            {log.usuario.nome}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-white/70">
                        <div className="flex items-center gap-2">
                          <Building2 size={14} className="opacity-40" /> {log.igreja.nome}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          isMasterAction ? "border-amber-500/30 text-amber-500 bg-amber-500/5" : "border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
                        }`}>
                          {log.acao}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-muted)] max-w-[300px] truncate" title={log.descricao}>
                        {log.descricao}
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