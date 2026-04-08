'use client'

import { useState } from 'react'
import { createRole, updateRole, deleteRole } from '@/app/actions/role'

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

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const nome = formData.get('nome') as string
    try {
      if (editingRole) {
        await updateRole(editingRole.id, nome, selectedPermissions)
        setEditingRole(null)
      } else {
        await createRole(nome, selectedPermissions)
        setIsAdding(false)
      }
      setSelectedPermissions([])
    } catch (err) {
      alert('Não foi possível salvar a função no momento.')
    }
    setLoading(false)
  }

  const handleDelete = async (id: string, nome: string) => {
    if (['ADMINISTRADOR', 'TESOUREIRO', 'VISUALIZADOR'].includes(nome)) {
      alert('Não é possível excluir as funções pré-definidas do sistema.')
      return
    }
    if (confirm('Tem certeza que deseja excluir esta função? Usuários vinculados poderão ser afetados.')) {
      try {
        await deleteRole(id)
      } catch (err) {
        alert('Erro inesperado: a função não pôde ser removida.')
      }
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
    <div className="card w-full">
      {/* Card header */}
      <div
        className="card-body"
        style={{ borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div>
          <h2 className="text-lg font-semibold mb-3">Gerenciar Funções</h2>
          <p className="text-xs opacity-70" style={{ margin: 'var(--space-1) 0 0 0', paddingBottom:'1.5%' }}>Defina funções e controle o acesso de cada usuário</p>
        </div>
        {!isAdding && !editingRole && (
          <button className="btn btn-primary btn-sm" onClick={() => setIsAdding(true)}>
            + Adicionar Função
          </button>
        )}
      </div>

      <div className="card-body">

        {/* Add / Edit form */}
        {(isAdding || editingRole) && (
          <form onSubmit={handleSave} style={{ marginBottom: 'var(--spacing-xl)' }}>
            <div className="card w-full">
              <div className="card-body">
              <h3 className="text-sm font-medium mb-3">
                {editingRole ? 'Editar Função' : 'Nova Função'}
              </h3>

              <div className="input-group">
                <label className="input-label">Nome da Função</label>
                <input
                  name="nome"
                  required
                  className="input input-field"
                  placeholder="Ex: Auxiliar Administrativo"
                  defaultValue={editingRole?.nome}
                  autoFocus
                />
              </div>

              {/* Permissions Accordion */}
              <div style={{ marginTop: 'var(--spacing-lg)' }}>
                <p className="input-label" style={{ marginBottom: 'var(--spacing-sm)' }}>Permissões do Sistema</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  {Object.entries(groupedPermissions).map(([module, perms]) => {
                    const allSelected = perms.every(p => selectedPermissions.includes(p.id))
                    const someSelected = perms.some(p => selectedPermissions.includes(p.id))
                    const selectedCount = perms.filter(p => selectedPermissions.includes(p.id)).length
                    const label = MODULE_LABELS[module] || module.charAt(0).toUpperCase() + module.slice(1)

                    return (
                      <details key={module} className="card w-full" open={someSelected}>
                        {/* Summary is the accordion header */}
                        <summary
                          style={{
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            listStyle: 'none',
                            userSelect: 'none',
                            borderRadius: 'var(--radius-lg)',
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{label}</span>
                            {selectedCount > 0 && (
                              <span className="badge badge-soft badge-primary text-xs">
                                {selectedCount}/{perms.length}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            className={`btn btn-xs btn-soft ${allSelected ? 'btn-error' : 'btn-success'}`}
                            style={{ fontSize: 'var(--text-xs)' }}
                            onClick={(e) => { e.preventDefault(); toggleModule(perms, allSelected) }}
                          >
                            {allSelected ? 'Remover todos' : 'Selecionar todos'}
                          </button>
                        </summary>

                        {/* Checkbox list */}
                        <div
                          style={{
                            padding: 'var(--spacing-sm) var(--spacing-md) var(--spacing-md)',
                            borderTop: '1px solid var(--border-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--spacing-sm)',
                          }}
                        >
                          {perms.map(p => (
                            <label
                              key={p.id}
                              style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer', fontSize: '0.875rem' }}
                            >
                              <input
                                type="checkbox"
                                className="checkbox checkbox-sm"
                                checked={selectedPermissions.includes(p.id)}
                                onChange={(e) => togglePermission(p.id, e.target.checked)}
                              />
                              <span style={{ color: 'var(--text-primary)' }}>{p.description}</span>
                            </label>
                          ))}
                        </div>
                      </details>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2" style={{ marginTop: 'var(--spacing-lg)' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={cancelAction}>
                  Cancelar
                </button>
              </div>
              </div>
            </div>
          </form>
        )}

        {/* Roles table */}
        {!isAdding && !editingRole && (
          <div className="table-responsive">
            <table className="table table-hover data-table">
              <thead>
                <tr>
                  <th>Função</th>
                  <th style={{ textAlign: 'center' }}>Permissões</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {initialRoles.map((r) => {
                  const isDefault = ['ADMINISTRADOR', 'TESOUREIRO', 'VISUALIZADOR'].includes(r.nome)
                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r.nome}</td>
                      <td style={{ textAlign: 'center' }}>
                        {isDefault ? (
                          <span className="badge badge-soft badge-neutral text-xs">Acesso Padrão</span>
                        ) : (
                          <span className="badge badge-soft badge-neutral text-xs">
                            {r.permissions?.length || 0} permissão(ões)
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex items-center gap-2 justify-end">
                          <button className="btn btn-soft btn-primary btn-sm" onClick={() => handleEdit(r)}>
                            Editar
                          </button>
                          <button
                            className="btn btn-soft btn-error btn-sm"
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
