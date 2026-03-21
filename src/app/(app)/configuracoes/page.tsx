import { getTenantPrisma } from "@/lib/auth"
import { redirect } from "next/navigation"
import ConfigItemManager from "./ConfigItemManager"

export default async function ConfiguracoesPage() {
  const { db, tenantId, user } = await getTenantPrisma()
  
  if (user.role !== 'ADMINISTRADOR') {
    redirect('/dashboard')
  }
  
  const [categorias, cultos] = await Promise.all([
    db.categoria.findMany({ where: { igreja_id: tenantId } }),
    db.culto.findMany({ where: { igreja_id: tenantId } })
  ])

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-3">Configurações</h1>
          <p className="text-xs opacity-70" style={{ margin: 'var(--space-1) 0 0 0' }}>Gerencie categorias e cultos da igreja</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-lg)' }}>
        
        <ConfigItemManager title="Categorias" type="categoria" items={categorias} />
        <ConfigItemManager title="Cultos" type="culto" items={cultos} />

      </div>
    </div>
  )
}
