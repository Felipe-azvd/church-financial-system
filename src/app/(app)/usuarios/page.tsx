import { getTenantPrisma, checkPermission } from "@/lib/auth"
import UserManager from "./UserManager"

export default async function UsuariosPage() {
  const { db, tenantId, user } = await getTenantPrisma()
  
  await checkPermission('usuarios.visualizar')
  
  const usuariosRaw = await db.usuario.findMany({
    where: { igreja_id: tenantId },
    orderBy: { nome: 'asc' },
    select: {
      id: true,
      nome: true,
      email: true,
      role_id: true,
      role: { select: { nome: true } }
    }
  })

  const roles = await db.role.findMany({
    where: { igreja_id: tenantId },
    orderBy: { nome: 'asc' },
    select: { id: true, nome: true }
  })

  const usuarios = usuariosRaw.map(u => ({
    id: u.id,
    nome: u.nome,
    email: u.email,
    role_id: u.role_id,
    role_nome: u.role?.nome || 'Desconhecido'
  }))

  return (
    <div className="px-6 py-6 lg:px-10 flex flex-col gap-6">
      <UserManager initialUsers={usuarios} initialRoles={roles} />
    </div>
  )
}
