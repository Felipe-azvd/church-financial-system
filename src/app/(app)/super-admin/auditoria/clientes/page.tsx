import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Users, Building2, Search } from "lucide-react"

export default async function AuditoriaClientesPage() {
  // Filtramos para ignorar a tua igreja matriz nos logs dos clientes
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
    <div className="p-8 space-y-8 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" /> 
            Auditoria de Clientes
          </h1>
          <p className="text-[var(--text-muted)] mt-2 italic">Monitorização de atividades em igrejas tenant.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border-tint)] bg-[var(--surface-tint)] overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="p-4 text-xs font-bold text-white uppercase tracking-wider">Data</th>
                <th className="p-4 text-xs font-bold text-white uppercase tracking-wider">Igreja</th>
                <th className="p-4 text-xs font-bold text-white uppercase tracking-wider">Usuário</th>
                <th className="p-4 text-xs font-bold text-white uppercase tracking-wider">Ação</th>
                <th className="p-4 text-xs font-bold text-white uppercase tracking-wider">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-[var(--text-muted)]">Nenhuma atividade de cliente registada.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-sm text-[var(--text-muted)]">
                      {format(log.criado_em, "dd/MM HH:mm", { locale: ptBR })}
                    </td>
                    <td className="p-4 text-sm font-semibold text-white">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Building2 size={14} /> {log.igreja.nome}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-white/80">{log.usuario.nome}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-white/10 text-white bg-white/5">
                        {log.acao}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-muted)] max-w-[250px] truncate">
                      {log.descricao}
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