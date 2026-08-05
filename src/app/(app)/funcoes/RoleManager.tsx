'use client'

import { useState } from 'react'
import { createRole, updateRole, deleteRole } from '@/app/actions/role'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import { Check } from 'lucide-react'

type PermissionData = { id: string; key: string; description: string }
type RoleData = {
  id: string
  nome: string
  permissions: PermissionData[]
}

const MODULE_LABELS: Record<string, string> = {
  dashboard:     'Dashboard',
  lancamentos:   'Lançamentos',
  relatorios:    'Relatórios',
  usuarios:      'Usuários',
  configuracoes: 'Configurações',
  funcoes:       'Funções',
}

const DEFAULT_ROLES = ['ADMINISTRADOR', 'TESOUREIRO', 'VISUALIZADOR']

export default function RoleManager({
  initialRoles,
  availablePermissions
}: {
  initialRoles: RoleData[]
  availablePermissions: PermissionData[]
}) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleData | null>(null)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { confirm, ConfirmDialogElement } = useConfirm()
  const { toast } = useToast()

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const nome = formData.get('nome') as string
    try {
      if (editingRole) {
        const result = await updateRole(editingRole.id, nome, selectedPermissions)
        if (result && !result.success) {
          toast(result.message || 'Erro ao atualizar função.', 'error')
          setLoading(false)
          return
        }
        setEditingRole(null)
      } else {
        await createRole(nome, selectedPermissions)
        setIsAdding(false)
      }
      setSelectedPermissions([])
    } catch (err) {
      toast('Não foi possível salvar a função no momento.', 'error')
    }
    setLoading(false)
  }

  const handleDelete = async (id: string, nome: string) => {
    if (DEFAULT_ROLES.includes(nome)) {
      toast('Não é possível excluir as funções pré-definidas do sistema.', 'error')
      return
    }
    const ok = await confirm({
      title: 'Excluir função',
      description: 'Tem certeza que deseja excluir esta função? Usuários vinculados poderão ser afetados.',
      tone: 'danger',
      confirmLabel: 'Excluir',
    })
    if (!ok) return
    try {
      await deleteRole(id)
    } catch (err) {
      toast('Erro inesperado: a função não pôde ser removida.', 'error')
    }
  }

  const cancelAction = () => {
    setIsAdding(false)
    setEditingRole(null)
    setSelectedPermissions([])
  }

  const handleEdit = (role: RoleData) => {
    setEditingRole(role)
    setSelectedPermissions(role.permissions.map(p => p.id))
  }

  const groupedPermissions = availablePermissions.reduce((acc, p) => {
    const [module] = p.key.split('.')
    if (!acc[module]) acc[module] = []
    acc[module].push(p)
    return acc
  }, {} as Record<string, PermissionData[]>)

  const togglePermission = (id: string, checked: boolean) => {
    if (checked) setSelectedPermissions(prev => [...prev, id])
    else setSelectedPermissions(prev => prev.filter(x => x !== id))
  }

  const toggleModule = (perms: PermissionData[], allSelected: boolean) => {
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(id => !perms.map(p => p.id).includes(id)))
    } else {
      const toAdd = perms.map(p => p.id).filter(id => !selectedPermissions.includes(id))
      setSelectedPermissions(prev => [...prev, ...toAdd])
    }
  }

  return (
    <div className="w-full">
      {ConfirmDialogElement}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Gerenciar Funções</h2>
          <p className="text-xs text-[var(--text-muted)]">Defina funções e controle o acesso de cada usuário</p>
        </div>
        {!isAdding && !editingRole && (
          <button className="btn-primary rounded-[var(--radius-field)] px-4 py-2" onClick={() => setIsAdding(true)}>
            + Adicionar Função
          </button>
        )}
      </div>

      <div className="w-full">
        {(isAdding || editingRole) && (
          <form onSubmit={handleSave} className="mb-8">
            <div className="card-glass p-8 relative rounded-[var(--radius-box)]">

              <h3 className="text-xl font-semibold mb-6 border-b border-[var(--color-base-300)] pb-4">
                {editingRole ? 'Editar Função' : 'Nova Função'}
              </h3>

              <div className="flex flex-col gap-2 mb-8">
                <label className="text-sm font-medium">Nome da Função</label>
                <input
                  name="nome"
                  required
                  className="input-field"
                  placeholder="Ex: Auxiliar Administrativo"
                  defaultValue={editingRole?.nome}
                  autoFocus
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-4">Permissões do Sistema</p>
                <div className="flex flex-col gap-4">
                  {Object.entries(groupedPermissions).map(([module, perms]) => {
                    const allSelected = perms.every(p => selectedPermissions.includes(p.id))
                    const someSelected = perms.some(p => selectedPermissions.includes(p.id))
                    const selectedCount = perms.filter(p => selectedPermissions.includes(p.id)).length
                    const label = MODULE_LABELS[module] || module.charAt(0).toUpperCase() + module.slice(1)

                    return (
                      <details key={module} className="bg-[var(--color-base-200)] border border-[var(--color-base-300)] rounded-[var(--radius-box)] overflow-hidden" open={someSelected}>
                        <summary className="flex items-center justify-between p-4 cursor-pointer select-none hover:bg-[var(--color-base-300)]/40 transition-colors list-none">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">{label}</span>
                            {selectedCount > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold border bg-[var(--primary-soft)] text-[var(--primary-color)] border-[var(--border-tint)]">
                                {selectedCount}/{perms.length}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            className={`text-sm font-medium transition-colors ${allSelected ? 'text-[var(--color-error)] hover:opacity-80' : 'text-[var(--color-primary)] hover:opacity-80'}`}
                            onClick={(e) => { e.preventDefault(); toggleModule(perms, allSelected) }}
                          >
                            {allSelected ? 'Remover todos' : 'Selecionar todos'}
                          </button>
                        </summary>

                        <div className="flex flex-col gap-3 p-5 border-t border-[var(--color-base-300)]">
                          {perms.map(p => {
                            const isChecked = selectedPermissions.includes(p.id)
                            return (
                              <label key={p.id} className="flex items-center gap-3 cursor-pointer group">
                                <span
                                  className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                                    isChecked ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'border-[var(--color-base-300)] bg-[var(--color-base-100)]'
                                  }`}
                                >
                                  {isChecked && <Check className="w-3.5 h-3.5 text-[var(--color-primary-content)]" />}
                                </span>
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={isChecked}
                                  onChange={(e) => togglePermission(p.id, e.target.checked)}
                                />
                                <span className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text-color)] transition-colors">{p.description}</span>
                              </label>
                            )
                          })}
                        </div>
                      </details>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t border-[var(--color-base-300)]">
                <button type="submit" className="btn-primary rounded-[var(--radius-field)] px-8 py-2" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Função'}
                </button>
                <button type="button" className="px-6 py-2 rounded-[var(--radius-field)] font-medium text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--color-base-200)] transition-colors" onClick={cancelAction}>
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        )}

        {!isAdding && !editingRole && (
          <div className="w-full overflow-x-auto md:overflow-visible md:rounded-[var(--radius-box)] md:border md:border-[var(--color-base-300)]">
            <table className="table table-hover data-table w-full !block md:!table md:min-w-[700px]">
              <thead className="hidden md:table-header-group">
                <tr>
                  <th>Função</th>
                  <th className="text-center">Permissões</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="block md:table-row-group">
                {initialRoles.map((r) => {
                  const isDefault = DEFAULT_ROLES.includes(r.nome)
                  return (
                    <tr key={r.id} className="flex flex-col bg-transparent py-4 border-b border-[var(--color-base-300)] last:border-b-0 md:table-row md:py-0 md:hover:bg-[var(--color-base-200)] transition-colors">
                      <td className="flex justify-between items-center gap-3 py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4 font-semibold">
                        <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs flex-shrink-0">Função</span>
                        <span className="truncate min-w-0 text-right md:text-left">{r.nome}</span>
                      </td>
                      <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4 md:text-center">
                        <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Permissões</span>
                        {isDefault ? (
                          <span className="px-3 py-1 rounded-full bg-[var(--color-base-200)] text-[var(--text-muted)] text-xs font-medium border border-[var(--color-base-300)]">Acesso Padrão</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-medium border bg-[var(--primary-soft)] text-[var(--primary-color)] border-[var(--border-tint)]">
                            {r.permissions?.length || 0} permissões
                          </span>
                        )}
                      </td>
                      <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4 md:text-right">
                        <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Ações</span>
                        <div className="flex items-center gap-2 justify-end">
                          <button className="px-3 py-1.5 rounded-[var(--radius-field)] text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors" onClick={() => handleEdit(r)}>
                            Editar
                          </button>
                          <button
                            className="px-3 py-1.5 rounded-[var(--radius-field)] text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                            onClick={() => handleDelete(r.id, r.nome)}
                            disabled={isDefault}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
