import { prisma } from "@/lib/prisma"
import { Crown, Building2, Users, Calendar, LineChart } from "lucide-react"
import NewChurchButton from "@/components/NewChurchButton"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function SuperAdminPage() {
  const user = await getCurrentUser()

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
    <div className="flex flex-col gap-6">

      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 rounded-[var(--radius-field)] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30">
          <Crown className="w-6 h-6 text-[var(--color-accent)]" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-semibold tracking-tight">Painel Super Admin</h1>
          <p className="text-sm text-[var(--color-accent)] mt-1">Controle global da plataforma</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Indicadores Principais</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="metric-card p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Igrejas Ativas</p>
              <h3 className="text-2xl font-bold tabular-nums mt-1">{totaisAtivas}</h3>
            </div>
          </div>

          <div className="metric-card p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 text-[var(--color-success)] flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Usuários Globais</p>
              <h3 className="text-2xl font-bold tabular-nums mt-1">{totalUsuarios}</h3>
            </div>
          </div>

          <div className="metric-card p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Novas Igrejas (30d)</p>
              <h3 className="text-2xl font-bold tabular-nums mt-1">{igrejasUltimos30Dias}</h3>
            </div>
          </div>

          <div className="metric-card p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-[var(--color-info)]/10 border border-[var(--color-info)]/20 text-[var(--color-info)] flex items-center justify-center flex-shrink-0">
              <LineChart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Média Usuários/Igreja</p>
              <h3 className="text-2xl font-bold tabular-nums mt-1">{mediaUsuarios}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[var(--radius-box)] border border-[var(--color-base-300)] bg-[var(--color-base-100)] shadow-[var(--shadow-sm)] p-6 mt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold">Igrejas Cadastradas Recentemente</h2>
          <div className="flex items-center gap-4">
            <Link
              href="/super-admin/igrejas"
              className="text-sm font-medium text-[var(--color-primary)] hover:opacity-80 transition-opacity uppercase tracking-wide"
            >
              Ver Tabela Completa
            </Link>
            <NewChurchButton />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {ultimasIgrejas.map((igreja) => {
            const masterName = igreja.usuarios?.[0]?.nome

            return (
              <div key={igreja.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-[var(--radius-field)] border border-[var(--color-base-300)] hover:bg-[var(--color-base-200)] transition-colors gap-4">
                <div>
                  <h4 className="text-base font-semibold">{igreja.nome}</h4>
                  {masterName && (
                    <p className="text-xs text-[var(--color-accent)] mt-0.5">Admin: {masterName}</p>
                  )}
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    Criada em {new Intl.DateTimeFormat('pt-BR').format(igreja.data_criacao)}
                  </p>
                </div>
                <div>
                  {igreja.ativo ? (
                    <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20">
                      Ativa
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20">
                      Bloqueada
                    </span>
                  )}
                </div>
              </div>
            )
          })}

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
