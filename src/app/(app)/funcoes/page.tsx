import { getTenantPrisma } from "@/lib/auth"
import { redirect } from "next/navigation"
import RoleManager from "./RoleManager"

export default async function FuncoesPage() {
  const { db, tenantId, user } = await getTenantPrisma()
  
  if (user.perfil !== 'ADMINISTRADOR') {
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
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>Cargos e Permissões</h1>
      <RoleManager initialRoles={roles} availablePermissions={availablePermissions} />
    </div>
  )
}
