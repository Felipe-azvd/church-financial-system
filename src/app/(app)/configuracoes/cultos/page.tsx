import { getTenantPrisma, checkPermission } from "@/lib/auth"
import ConfigItemManager from "./ConfigItemManager"

export default async function ConfiguracoesPage() {
  const { db, tenantId, user } = await getTenantPrisma()
  
  await checkPermission('configuracoes.visualizar')
  
  const [categorias, cultos] = await Promise.all([
    db.categoria.findMany({ where: { igreja_id: tenantId } }),
    db.culto.findMany({ where: { igreja_id: tenantId } })
  ])

  return (
    <div className="px-6 py-6 lg:px-10 flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-3">Configurações</h1>
          <p className="text-xs opacity-70 mt-1">Gerencie categorias e cultos da igreja</p>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        
        <ConfigItemManager title="Categorias" type="categoria" items={categorias} />
        <ConfigItemManager title="Cultos" type="culto" items={cultos} />

      </div>
    </div>
  )
}
