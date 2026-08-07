import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ScrollText } from "lucide-react"
import ChangelogInternoManager from "./ChangelogInternoManager"

export default async function ChangelogInternoPage() {
  const user = await getCurrentUser()

  if (!user || !user.permissions.includes('*')) {
    redirect('/dashboard')
  }

  const entradas = await prisma.changelogInterno.findMany({
    orderBy: { criado_em: 'desc' }
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 rounded-[var(--radius-field)] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30">
          <ScrollText className="w-6 h-6 text-[var(--color-accent)]" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-semibold tracking-tight">Changelog Interno</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Registro técnico de todas as alterações do sistema — uso exclusivo do Super Admin.</p>
        </div>
      </div>

      <ChangelogInternoManager
        entradas={entradas.map((e) => ({ ...e, criado_em: e.criado_em.toISOString() }))}
      />
    </div>
  )
}
