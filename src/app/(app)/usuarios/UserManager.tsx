'use client'

import { useState, useEffect, useRef } from 'react'
import { createUser, updateUser, deleteUser } from '@/app/actions/user'
import { ChevronDown } from 'lucide-react'

type User = { id: string; nome: string; email: string; role_nome: string; role_id: string }
type Role = { id: string; nome: string }

export default function UserManager({ initialUsers, initialRoles }: { initialUsers: User[], initialRoles: Role[] }) {
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  const roleDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editingUser) {
      setSelectedRoleId(editingUser.role_id)
    } else if (isAdding && initialRoles.length > 0) {
      setSelectedRoleId(initialRoles[0].id)
    }
  }, [editingUser, isAdding, initialRoles])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const data = {
      nome: formData.get('nome') as string,
      email: formData.get('email') as string,
      senha: formData.get('senha') as string,
      role_id: selectedRoleId
    }

    try {
      let res;
      if (editingUser) {
        res = await updateUser(editingUser.id, data)
      } else {
        res = await createUser(data)
      }

      // Se a resposta vier com success: false, disparamos a mensagem de erro para a caixinha vermelha!
      if (res && !res.success) {
        throw new Error(res.error)
      }

      // Se deu tudo certo, limpamos a tela
      if (editingUser) {
        setEditingUser(null)
      } else {
        setIsAdding(false)
      }
    } catch (err: any) {
      setError(err.message || 'Não foi possível salvar o usuário neste momento.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir permanentemente este usuário?')) {
      try {
        const res = await deleteUser(id)
        if (res && !res.success) {
          throw new Error(res.error)
        }
      } catch (err: any) {
        alert(err.message || 'Não foi possível excluir o usuário permanentemente.')
      }
    }
  }

  const closeForm = () => {
    setIsAdding(false)
    setEditingUser(null)
    setError('')
  }

  const selectedRoleName = initialRoles.find(r => r.id === selectedRoleId)?.nome || 'Selecione uma função'

  return (
    <>
      {/* CORREÇÃO AQUI: flex-col no mobile, sm:flex-row no desktop */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1 text-white">Usuários</h1>
          <p className="text-xs text-[var(--text-muted)]">Gerencie os usuários e seus acessos</p>
        </div>
        <div className="flex items-center w-full sm:w-auto">
          {(!isAdding && !editingUser) && (
            <button className="btn-primary !rounded-lg px-4 py-2 w-full sm:w-auto" onClick={() => setIsAdding(true)}>+ Novo Usuário</button>
          )}
        </div>
      </div>

      {(isAdding || editingUser) && (
        <form onSubmit={handleSave} className="card-glass p-8 relative rounded-2xl animate-[fadeIn_0.2s_ease-out] mb-8">
          <h3 className="text-xl font-semibold mb-6 text-white border-b border-white/10 pb-4">
            {editingUser ? 'Editar Usuário' : 'Criar Usuário'}
          </h3>
          
          {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="flex flex-col gap-2 bg-black/20 p-4 rounded-xl border border-white/5">
              <label className="text-sm font-medium text-[var(--text-color)]">Nome</label>
              <input name="nome" required className="input-field bg-transparent border border-white/10 focus:border-[var(--primary-color)] text-white h-[42px] px-3 transition-all" defaultValue={editingUser?.nome} />
            </div>

            <div className="flex flex-col gap-2 bg-black/20 p-4 rounded-xl border border-white/5">
              <label className="text-sm font-medium text-[var(--text-color)]">E-mail</label>
              <input type="email" name="email" required className="input-field bg-transparent border border-white/10 focus:border-[var(--primary-color)] text-white h-[42px] px-3 transition-all" defaultValue={editingUser?.email} />
            </div>

            <div className="flex flex-col gap-2 bg-black/20 p-4 rounded-xl border border-white/5">
              <label className="text-sm font-medium text-[var(--text-color)]">Senha {editingUser && <span className="text-xs opacity-50 block">(Deixe em branco p/ manter)</span>}</label>
              <input type="password" name="senha" required={!editingUser} className="input-field bg-transparent border border-white/10 focus:border-[var(--primary-color)] text-white h-[42px] px-3 transition-all" />
            </div>

            <div className="flex flex-col gap-2 bg-black/20 p-4 rounded-xl border border-white/5">
              <label className="text-sm font-medium text-[var(--text-color)]">Cargo / Função</label>
              
              <div className="relative" ref={roleDropdownRef}>
                <button
                  type="button"
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center justify-between w-full bg-transparent border border-white/10 text-white rounded-lg hover:border-[var(--primary-color)] transition-all outline-none"
                  style={{ height: '42px', padding: '0 1rem', fontSize: '0.95rem' }}
                >
                  <span className="truncate">{selectedRoleName}</span>
                  <ChevronDown size={16} className={`text-[var(--text-muted)] transition-transform duration-200 ${roleDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-[var(--bg-page)] border border-[var(--border-tint)] rounded-lg shadow-2xl overflow-hidden z-50 animate-[fadeIn_0.1s_ease-out]">
                    {initialRoles.map(r => {
                      const isSelected = selectedRoleId === r.id
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => { setSelectedRoleId(r.id); setRoleDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-3 text-[0.95rem] font-medium transition-colors ${
                            isSelected
                              ? 'text-[var(--primary-color)]' 
                              : 'text-gray-300 hover:bg-white/5 hover:text-white'
                          }`}
                          style={{ backgroundColor: isSelected ? 'var(--primary-soft)' : 'transparent' }}
                        >
                          {r.nome}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-6 border-t border-white/10">
            <button type="button" className="px-6 py-2 rounded-lg font-medium text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10" onClick={closeForm}>Cancelar</button>
            <button type="submit" className="btn-primary !rounded-lg px-8 py-2" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Usuário'}
            </button>
          </div>
        </form>
      )}

      {/* CORREÇÃO AQUI: Tabela responsiva com rolagem horizontal */}
      {(!isAdding && !editingUser) && (
        <div className="w-full overflow-x-auto md:overflow-visible md:rounded-2xl md:border md:border-[var(--border-tint)] md:bg-[var(--surface-tint)] md:shadow-sm max-h-[500px] overflow-y-auto">
          <table className="table table-hover data-table w-full block md:table md:min-w-[700px]">
            <thead className="hidden md:table-header-group">
              <tr>
                <th className="!bg-[var(--surface-tint)] !text-[var(--primary-color)]">Nome</th>
                <th className="!bg-[var(--surface-tint)] !text-[var(--primary-color)]">Email</th>
                <th className="!bg-[var(--surface-tint)] !text-[var(--primary-color)]">Perfil</th>
                <th className="!bg-[var(--surface-tint)] !text-[var(--primary-color)] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group">
              {initialUsers.length === 0 ? (
                <tr className="block md:table-row">
                  <td colSpan={4} style={{ padding: 'var(--spacing-2xl) 0' }} className="block md:table-cell text-center">
                    <p style={{ color: 'var(--text-muted)', fontWeight: 500, marginBottom: 'var(--spacing-xl)', paddingBottom:"1.1%" }}>Nenhum usuário encontrado no sistema.</p>
                    <button className="btn btn-secondary !rounded-lg px-4 py-2 text-sm" onClick={() => setIsAdding(true)}>
                      Adicione um usuário para começar
                    </button>
                  </td>
                </tr>
              ) : (
                initialUsers.map((u) => (
                  <tr key={u.id} className="flex flex-col bg-transparent py-4 border-b border-white/5 last:border-b-0 md:table-row md:py-0 md:border-white/5 md:hover:bg-white/5 transition-colors">
                    <td className="flex justify-between items-center py-2 border-b border-white/5 last:border-b-0 md:table-cell md:border-none md:py-4 font-semibold text-white">
                      <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Nome</span>
                      <span>{u.nome}</span>
                    </td>
                    <td className="flex justify-between items-center py-2 border-b border-white/5 last:border-b-0 md:table-cell md:border-none md:py-4" style={{ color: 'var(--text-secondary)' }}>
                      <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Email</span>
                      <span>{u.email}</span>
                    </td>
                    <td className="flex justify-between items-center py-2 border-b border-white/5 last:border-b-0 md:table-cell md:border-none md:py-4">
                      <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Perfil</span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium border"
                            style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary-color)', borderColor: 'var(--border-tint)' }}>
                        {u.role_nome.toUpperCase()}
                      </span>
                    </td>
                    <td className="flex justify-between items-center py-2 border-b border-white/5 last:border-b-0 md:table-cell md:border-none md:py-4 md:text-right">
                      <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Ações</span>
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => setEditingUser(u)} className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors" style={{ color: 'var(--primary-color)' }}>Editar</button>
                        <button onClick={() => handleDelete(u.id)} className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}