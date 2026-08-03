import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { Crown, Network, Building2, Plus, ArrowRight, Lock } from "lucide-react"
import Link from 'next/link'
import { redirect } from "next/navigation"

export default async function FiliaisPage() {
  const user = await getCurrentUser()
  if (!user?.igreja_id) redirect('/login')

  const igrejaAtual = await prisma.igreja.findUnique({
    where: { id: user.igreja_id }
  })

  if (!igrejaAtual) redirect('/login')

  const isPremium = igrejaAtual.plano === 'PREMIUM'

  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh]">
        <div className="max-w-xl w-full rounded-[var(--radius-box)] border border-[var(--color-base-300)] bg-[var(--color-base-100)] p-10 text-center shadow-[var(--shadow-md)]">
          <div className="flex justify-center mb-6">
            <div className="p-5 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[var(--color-accent)] relative">
              <Network className="w-12 h-12" />
              <div className="absolute -bottom-2 -right-2 bg-[var(--color-base-100)] rounded-full p-1 border border-[var(--color-accent)]/20">
                <Lock className="w-5 h-5 text-[var(--color-accent)]" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-serif font-semibold mb-4 tracking-tight">Gestão de Filiais</h1>
          <p className="text-[var(--text-muted)] text-lg mb-8 leading-relaxed">
            A gestão multi-tenant (Matriz e Filiais) é um recurso avançado exclusivo do plano <span className="font-semibold text-[var(--color-accent)] uppercase tracking-wide">Premium</span>. Centralize cadastros, relatórios e permissões de todas as congregações em um único ambiente.
          </p>

          <Link
            href="/configuracoes/assinatura"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-[var(--radius-field)] font-semibold text-[var(--color-primary-content)] bg-[var(--color-primary)] hover:opacity-90 transition-opacity"
          >
            <Crown className="w-5 h-5" />
            Fazer Upgrade Agora
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    )
  }

  const filiais = await prisma.igreja.findMany({
    where: { matriz_id: igrejaAtual.id },
    orderBy: { nome: 'asc' }
  })

  return (
    <div className="flex flex-col gap-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-[var(--radius-field)] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30">
            <Network className="w-6 h-6 text-[var(--color-accent)]" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-semibold tracking-tight">Unidades e Filiais</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Gestão centralizada de congregações</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled
            title="Em breve"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-[var(--radius-field)] font-medium text-[var(--text-muted)] bg-[var(--color-base-200)] border border-[var(--color-base-300)] cursor-not-allowed opacity-70"
          >
            <Plus className="w-4 h-4" />
            Nova Filial
          </button>
          <span className="text-xs font-medium text-[var(--text-muted)] bg-[var(--color-base-200)] px-2 py-1 rounded-full border border-[var(--color-base-300)]">Em breve</span>
        </div>
      </div>

      {/* LISTA DE FILIAIS */}
      <div className="rounded-[var(--radius-box)] border border-[var(--color-base-300)] bg-[var(--color-base-100)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-[var(--color-base-300)] text-sm font-medium text-[var(--text-muted)]">
                <th className="py-4 pl-6 font-semibold">Nome da Filial</th>
                <th className="py-4 font-semibold">Status</th>
                <th className="py-4 text-right pr-6 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filiais.map((filial) => (
                <tr key={filial.id} className="border-b border-[var(--color-base-300)] last:border-b-0 hover:bg-[var(--color-base-200)] transition-colors">
                  <td className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[var(--color-base-200)] rounded-[var(--radius-field)] border border-[var(--color-base-300)] text-[var(--color-accent)]">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="font-semibold">{filial.nome}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    {filial.ativo ? (
                      <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20">
                        Ativa
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20">
                        Bloqueada
                      </span>
                    )}
                  </td>
                  <td className="py-4 text-right pr-6">
                    <button
                      disabled
                      title="Em breve"
                      className="text-xs px-4 py-2 rounded-[var(--radius-field)] font-medium bg-[var(--color-base-200)] text-[var(--text-muted)] border border-[var(--color-base-300)] cursor-not-allowed"
                    >
                      Gerenciar
                    </button>
                  </td>
                </tr>
              ))}

              {filiais.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-16 text-center">
                    <Network className="w-12 h-12 text-[var(--color-base-300)] mx-auto mb-4" />
                    <p className="text-base text-[var(--text-muted)] font-medium">Nenhuma filial localizada.</p>
                    <p className="text-sm text-[var(--text-muted)] mt-1 opacity-70">O cadastro de novas filiais estará disponível em breve.</p>
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
