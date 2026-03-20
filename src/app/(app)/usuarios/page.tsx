import { getTenantPrisma } from "@/lib/auth"
import { redirect } from "next/navigation"
import UserManager from "./UserManager"

export default async function UsuariosPage() {
  const { db, tenantId, user } = await getTenantPrisma()
  
  if (user.role !== 'ADMINISTRADOR') {
    redirect('/dashboard')
  }
  
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
    <div>
      <UserManager initialUsers={usuarios} initialRoles={roles} />
    </div>
  )
}
