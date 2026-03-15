'use client'

import { useState } from 'react'
import { createUser, updateUser, deleteUser } from '@/app/actions/user'

type User = { id: string; nome: string; email: string; role_nome: string; role_id: string }
type Role = { id: string; nome: string }

export default function UserManager({ initialUsers, initialRoles }: { initialUsers: User[], initialRoles: Role[] }) {
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const data = {
      nome: formData.get('nome') as string,
      email: formData.get('email') as string,
      senha: formData.get('senha') as string,
      role_id: formData.get('role_id') as string
    }

    try {
      if (editingUser) {
        await updateUser(editingUser.id, data)
        setEditingUser(null)
      } else {
        await createUser(data)
        setIsAdding(false)
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar usuário.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir permanentemente este usuário?')) {
      try {
        await deleteUser(id)
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir usuário.')
      }
    }
  }

  const closeForm = () => {
    setIsAdding(false)
    setEditingUser(null)
    setError('')
  }

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h1 className="text-xl font-semibold" style={{ margin: 0 }}>Usuários</h1>
          <p className="text-sm" style={{ margin: '0.25rem 0 0 0', opacity: 0.7 }}>Gerencie os usuários e seus acessos</p>
        </div>
        <div className="flex items-center gap-3">
          {(!isAdding && !editingUser) && (
            <button className="btn btn-primary" onClick={() => setIsAdding(true)}>Novo Usuário</button>
          )}
        </div>
      </div>

      {(isAdding || editingUser) && (
        <form onSubmit={handleSave} className="card" style={{ marginBottom: 'var(--spacing-md)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>
            {editingUser ? 'Editar Usuário' : 'Criar Usuário'}
          </h3>
          
          {error && <div style={{ color: 'var(--danger)', marginBottom: 'var(--spacing-sm)' }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
            <div className="input-group">
              <label className="input-label">Nome</label>
              <input name="nome" required className="input input-field" defaultValue={editingUser?.nome} />
            </div>

            <div className="input-group">
              <label className="input-label">E-mail</label>
              <input type="email" name="email" required className="input input-field" defaultValue={editingUser?.email} />
            </div>

            <div className="input-group">
              <label className="input-label">Senha {editingUser && '(Deixe em branco para manter)'}</label>
              <input type="password" name="senha" required={!editingUser} className="input input-field" />
            </div>

            <div className="input-group">
              <label className="input-label">Cargo / Função</label>
              <select name="role_id" className="select input-field" defaultValue={editingUser?.role_id || initialRoles[0]?.id}>
                {initialRoles.map((r) => (
                  <option key={r.id} value={r.id}>{r.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={closeForm}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      )}

      {(!isAdding && !editingUser) && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table table-hover data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Perfil</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {initialUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-muted)' }}>
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                ) : (
                  initialUsers.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 500 }}>{u.nome}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td>
                        <span className="badge badge-soft badge-info">
                          {u.role_nome.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
                          <button onClick={() => setEditingUser(u)} className="btn btn-soft btn-primary btn-sm">Editar</button>
                          <button onClick={() => handleDelete(u.id)} className="btn btn-soft btn-error btn-sm">Excluir</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
