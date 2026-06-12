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
        const result = await updateRole(editingRole.id, nome, selectedPermissions)
        if (result && !result.success) {
          alert(result.message || 'Erro ao atualizar função.')
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
    <div className="w-full">
      {/* Cabeçalho Responsivo (Empilha no celular) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1 text-white">Gerenciar Funções</h2>
          <p className="text-xs text-[var(--text-muted)]">Defina funções e controle o acesso de cada usuário</p>
        </div>
        {!isAdding && !editingRole && (
          <button className="btn-primary !rounded-lg px-4 py-2" onClick={() => setIsAdding(true)}>
            + Adicionar Função
          </button>
        )}
      </div>

      <div className="w-full">
        {(isAdding || editingRole) && (
          <form onSubmit={handleSave} className="mb-8">
            <div className="card-glass p-8 relative rounded-2xl animate-[fadeIn_0.2s_ease-out]">
              
              <h3 className="text-xl font-semibold mb-6 text-white border-b border-white/10 pb-4">
                {editingRole ? 'Editar Função' : 'Nova Função'}
              </h3>

              <div className="flex flex-col gap-2 mb-8">
                <label className="text-sm font-medium text-[var(--text-color)]">Nome da Função</label>
                <input
                  name="nome"
                  required
                  className="input-field bg-black/20 focus:border-[var(--primary-color)] transition-all text-white h-[42px] px-4"
                  placeholder="Ex: Auxiliar Administrativo"
                  defaultValue={editingRole?.nome}
                  autoFocus
                />
              </div>

              <div>
                <p className="text-sm font-medium text-[var(--text-color)] mb-4">Permissões do Sistema</p>
                <div className="flex flex-col gap-4">
                  {Object.entries(groupedPermissions).map(([module, perms]) => {
                    const allSelected = perms.every(p => selectedPermissions.includes(p.id))
                    const someSelected = perms.some(p => selectedPermissions.includes(p.id))
                    const selectedCount = perms.filter(p => selectedPermissions.includes(p.id)).length
                    const label = MODULE_LABELS[module] || module.charAt(0).toUpperCase() + module.slice(1)

                    return (
                      <details key={module} className="bg-black/20 border border-white/10 rounded-xl overflow-hidden" open={someSelected}>
                        <summary className="flex items-center justify-between p-4 cursor-pointer select-none hover:bg-white/5 transition-colors" style={{ listStyle: 'none' }}>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-white">{label}</span>
                            {selectedCount > 0 && (
                              <span 
                                className="px-2 py-0.5 rounded-full text-xs font-semibold border"
                                style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary-color)', borderColor: 'var(--border-tint)' }}
                              >
                                {selectedCount}/{perms.length}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            className={`text-sm font-medium transition-colors ${allSelected ? 'text-red-400 hover:text-red-300' : 'text-blue-400 hover:text-blue-300'}`}
                            style={{ color: !allSelected ? 'var(--primary-color)' : '' }}
                            onClick={(e) => { e.preventDefault(); toggleModule(perms, allSelected) }}
                          >
                            {allSelected ? 'Remover todos' : 'Selecionar todos'}
                          </button>
                        </summary>

                        <div className="flex flex-col gap-3 p-5 border-t border-white/10 bg-black/10">
                          {perms.map(p => {
                            const isChecked = selectedPermissions.includes(p.id)
                            return (
                              <label key={p.id} className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                  <input
                                    type="checkbox"
                                    className="peer appearance-none w-5 h-5 border border-white/20 rounded bg-black/40 transition-all cursor-pointer"
                                    style={{ 
                                      backgroundColor: isChecked ? 'var(--primary-color)' : '', 
                                      borderColor: isChecked ? 'var(--primary-color)' : '' 
                                    }}
                                    checked={isChecked}
                                    onChange={(e) => togglePermission(p.id, e.target.checked)}
                                  />
                                  <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{p.description}</span>
                              </label>
                            )
                          })}
                        </div>
                      </details>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
                <button type="submit" className="btn-primary !rounded-lg px-8 py-2" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Função'}
                </button>
                <button type="button" className="px-6 py-2 rounded-lg font-medium text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10" onClick={cancelAction}>
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tabela Responsiva com Cores do Tema */}
        {!isAdding && !editingRole && (
          <div className="w-full overflow-x-auto rounded-2xl border border-[var(--border-tint)] bg-[var(--surface-tint)] shadow-sm">
            <table className="table table-hover data-table w-full min-w-[700px]">
              <thead>
                <tr>
                  <th className="!bg-[var(--surface-tint)] !text-[var(--primary-color)]">Função</th>
                  <th className="!bg-[var(--surface-tint)] !text-[var(--primary-color)]" style={{ textAlign: 'center' }}>Permissões</th>
                  <th className="!bg-[var(--surface-tint)] !text-[var(--primary-color)]" style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {initialRoles.map((r) => {
                  const isDefault = ['ADMINISTRADOR', 'TESOUREIRO', 'VISUALIZADOR'].includes(r.nome)
                  return (
                    <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="font-semibold text-white">{r.nome}</td>
                      <td style={{ textAlign: 'center' }}>
                        {isDefault ? (
                          <span className="px-3 py-1 rounded-full bg-white/10 text-gray-300 text-xs font-medium border border-white/10">Acesso Padrão</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-medium border"
                                style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary-color)', borderColor: 'var(--border-tint)' }}>
                            {r.permissions?.length || 0} permissões
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex items-center gap-2 justify-end">
                          <button className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors" style={{ color: 'var(--primary-color)' }} onClick={() => handleEdit(r)}>
                            Editar
                          </button>
                          <button
                            className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
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
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}