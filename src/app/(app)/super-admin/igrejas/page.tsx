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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-[var(--radius-field)] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30">
            <Building2 className="w-6 h-6 text-[var(--color-accent)]" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-semibold tracking-tight">Gerenciar Igrejas</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Tabela completa de organizações cadastradas</p>
          </div>
        </div>
      </div>

      <div className="rounded-[var(--radius-box)] border border-[var(--color-base-300)] bg-[var(--color-base-100)] shadow-[var(--shadow-sm)] overflow-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-[var(--color-base-300)]">
          <div className="relative max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Buscar organização..."
              className="input-field w-full pl-10"
            />
          </div>
          <div className="text-sm font-medium text-[var(--text-muted)]">
            Total: {igrejas.length} {igrejas.length === 1 ? 'igreja' : 'igrejas'}
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse block md:table md:min-w-[700px]">
            <thead className="hidden md:table-header-group">
              <tr className="border-b border-[var(--color-base-300)] text-sm font-medium text-[var(--text-muted)]">
                <th className="py-4 pl-6 font-semibold">ID</th>
                <th className="py-4 font-semibold">Nome da Igreja</th>
                <th className="py-4 font-semibold">Administrador</th>
                <th className="py-4 font-semibold">Usuários</th>
                <th className="py-4 font-semibold">Status</th>
                <th className="py-4 text-right pr-6 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group text-sm">
              {igrejas.map((igreja) => {
                const master = igreja.usuarios?.[0]

                const toggleAction = async () => {
                  "use server"
                  await alternarStatusIgreja(igreja.id, !igreja.ativo)
                }

                return (
                  <tr key={igreja.id} className="flex flex-col bg-transparent py-4 border-b border-[var(--color-base-300)] last:border-b-0 md:table-row md:py-0 md:hover:bg-[var(--color-base-200)] transition-colors group">
                    <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4 md:pl-6 font-mono text-xs text-[var(--text-muted)] tracking-wider">
                      <span className="md:hidden font-semibold text-[var(--text-muted)]">ID</span>
                      <span>{igreja.id.length < 5 ? `#${igreja.id.padStart(4, '0')}` : `#${igreja.id.slice(1, 9).toUpperCase()}`}</span>
                    </td>
                    <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4 font-semibold">
                      <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Igreja</span>
                      <span>{igreja.nome}</span>
                    </td>
                    <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4">
                      <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Administrador</span>
                      {master ? (
                        <div className="flex flex-col md:block text-right md:text-left">
                          <span className="text-sm font-semibold">{master.nome}</span>
                          <span className="text-xs text-[var(--text-muted)]">{master.email}</span>
                        </div>
                      ) : (
                        <span className="text-sm italic text-[var(--text-muted)]">Sem admin</span>
                      )}
                    </td>
                    <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4 font-medium text-[var(--text-muted)]">
                      <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Usuários</span>
                      <span>{igreja._count.usuarios}</span>
                    </td>
                    <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4">
                      <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Status</span>
                      {igreja.ativo ? (
                        <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20">
                          Ativa
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20">
                          Bloqueada
                        </span>
                      )}
                    </td>
                    <td className="flex justify-between items-center py-4 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4 md:text-right md:pr-6">
                      <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Ações</span>
                      <div className="flex items-center justify-end gap-3">
                        <form action={async () => {
                          "use server"
                          await acessarIgrejaCliente(igreja.id)
                          redirect('/dashboard')
                        }}>
                          <button
                            type="submit"
                            disabled={!igreja.ativo}
                            className="text-xs px-4 py-2 rounded-[var(--radius-field)] font-semibold bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Entrar no painel corporativo desta igreja"
                          >
                            Acessar
                          </button>
                        </form>

                        <form action={toggleAction}>
                          <button
                            type="submit"
                            className={`text-xs px-4 py-2 rounded-[var(--radius-field)] font-semibold transition-colors ${
                              igreja.ativo
                                ? 'bg-[var(--color-error)]/10 text-[var(--color-error)] hover:bg-[var(--color-error)]/20 border border-[var(--color-error)]/20'
                                : 'bg-[var(--color-success)]/10 text-[var(--color-success)] hover:bg-[var(--color-success)]/20 border border-[var(--color-success)]/20'
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
