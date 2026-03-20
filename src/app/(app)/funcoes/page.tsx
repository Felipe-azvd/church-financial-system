import { getTenantPrisma } from "@/lib/auth"
import { redirect } from "next/navigation"
import RoleManager from "./RoleManager"

export default async function FuncoesPage() {
  const { db, tenantId, user } = await getTenantPrisma()
  
  if (user.role !== 'ADMINISTRADOR') {
    redirect('/dashboard')
  }
  
  const rolesRaw = await db.role.findMany({
    where: { igreja_id: tenantId },
    orderBy: { nome: 'asc' },
    select: {
      id: true,
      nome: true,
      role_permissions: {
        select: { permission: true }
      }
    }
  })

  const roles = rolesRaw.map((r: any) => ({
    id: r.id,
    nome: r.nome,
    permissions: r.role_permissions.map((rp: any) => rp.permission)
  }))

  const availablePermissions = await db.permission.findMany({
    orderBy: { key: 'asc' }
  })

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ margin: 0 }}>Cargos e Permissões</h1>
          <p className="text-xs opacity-70" style={{ margin: 'var(--space-1) 0 0 0' }}>Defina funções e controle o acesso de cada usuário</p>
        </div>
      </div>
      <RoleManager initialRoles={roles} availablePermissions={availablePermissions} />
    </div>
  )
}
