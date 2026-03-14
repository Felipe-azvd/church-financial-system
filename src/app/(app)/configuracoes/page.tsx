import { getTenantPrisma } from "@/lib/auth"
import { redirect } from "next/navigation"
import ConfigItemManager from "./ConfigItemManager"

export default async function ConfiguracoesPage() {
  const { db, tenantId, user } = await getTenantPrisma()
  
  if (user.perfil !== 'ADMINISTRADOR') {
    redirect('/dashboard')
  }
  
  const [categorias, cultos] = await Promise.all([
    db.categoria.findMany({ where: { igreja_id: tenantId } }),
    db.culto.findMany({ where: { igreja_id: tenantId } })
  ])

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>Configurações</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-lg)' }}>
        
        <ConfigItemManager title="Categorias" type="categoria" items={categorias} />
        <ConfigItemManager title="Cultos" type="culto" items={cultos} />

      </div>
    </div>
  )
}
