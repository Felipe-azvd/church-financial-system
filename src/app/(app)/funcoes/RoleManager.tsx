'use client'

import { useState } from 'react'
import { createRole, updateRole, deleteRole } from '@/app/actions/role'

type PermissionData = { id: string; key: string; description: string }
type RoleData = {
  id: string
  nome: string
  permissions: PermissionData[]
}

export default function RoleManager({ initialRoles, availablePermissions }: { initialRoles: RoleData[], availablePermissions: PermissionData[] }) {
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
    } catch(err) {
      alert("Erro ao salvar função.")
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
      } catch(err) {
        alert("Erro ao remover função.")
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

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Gerenciar Funções</h2>
        {!isAdding && !editingRole && (
          <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
            Adicionar Função
          </button>
        )}
      </div>

      {(isAdding || editingRole) && (
        <form onSubmit={handleSave} className="card" style={{ marginBottom: 'var(--spacing-xl)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>
            {editingRole ? 'Editar Função' : 'Nova Função'}
          </h3>
          
          <div className="input-group">
            <label className="input-label">Nome da Função</label>
            <input 
              name="nome" 
              required 
              className="input-field" 
              placeholder="Ex: Auxiliar Administrativo" 
              defaultValue={editingRole?.nome}
              autoFocus 
            />
          </div>

          <div style={{ marginTop: 'var(--spacing-md)' }}>
            <label className="input-label" style={{ marginBottom: 'var(--spacing-sm)' }}>Permissões do Sistema</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {Object.entries(groupedPermissions).map(([module, perms]) => (
                <div key={module} style={{ backgroundColor: 'var(--bg-primary)', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ textTransform: 'capitalize', marginBottom: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>
                    Módulo: {module}
                  </h4>
                  <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                    {perms.map(p => (
                      <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', cursor: 'pointer', fontSize: '0.875rem' }}>
                        <input 
                          type="checkbox" 
                          style={{ accentColor: 'var(--primary)' }}
                          checked={selectedPermissions.includes(p.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedPermissions([...selectedPermissions, p.id])
                            else setSelectedPermissions(selectedPermissions.filter(id => id !== p.id))
                          }}
                        />
                        {p.description}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={cancelAction}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {(!isAdding && !editingRole) && (
        <div className="table-responsive">
          <table className="data-table">
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
                    <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      {isDefault ? 'Acesso Padrão' : `${r.permissions?.length || 0} permissão(ões)`} 
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyItems: 'flex-end', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => handleEdit(r)}
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(r.id, r.nome)}
                          className="btn btn-secondary" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: isDefault ? 'var(--text-muted)' : 'var(--danger)', borderColor: 'transparent', background: 'transparent' }}
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
  )
}
