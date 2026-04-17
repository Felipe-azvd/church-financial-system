import { getTenantPrisma, checkPermission } from "@/lib/auth"
import RoleManager from "./RoleManager"

export default async function FuncoesPage() {
  const { db, tenantId, user } = await getTenantPrisma()
  
  await checkPermission('funcoes.visualizar')
  
  const rolesRaw = await db.role.findMany({
    where: { igreja_id: tenantId, nome: { not: 'MASTER' } },
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
    where: { key: { not: '*' } }, // 🔥 Impede que a permissão "Modo Deus" apareça na lista
    orderBy: { key: 'asc' }
  })

  return (
    <div className="px-6 py-6 lg:px-10 flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-3">Cargos e Permissões</h1>
          <p className="text-xs opacity-70" style={{ margin: 'var(--space-1) 0 0 0' }}>Defina funções e controle o acesso de cada usuário</p>
        </div>
      </div>
      <RoleManager initialRoles={roles} availablePermissions={availablePermissions} />
    </div>
  )
}
