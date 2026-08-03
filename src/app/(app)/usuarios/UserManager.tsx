'use client'

import { useState, useEffect } from 'react'
import { createUser, updateUser, deleteUser } from '@/app/actions/user'
import { Select } from '@/components/ui/Select'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'

type User = { id: string; nome: string; email: string; role_nome: string; role_id: string }
type Role = { id: string; nome: string }

export default function UserManager({ initialUsers, initialRoles }: { initialUsers: User[], initialRoles: Role[] }) {
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  const { confirm, ConfirmDialogElement } = useConfirm()
  const { toast } = useToast()

  useEffect(() => {
    if (editingUser) {
      setSelectedRoleId(editingUser.role_id)
    } else if (isAdding && initialRoles.length > 0) {
      setSelectedRoleId(initialRoles[0].id)
    }
  }, [editingUser, isAdding, initialRoles])

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

      if (res && !res.success) {
        throw new Error(res.error)
      }

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
    const ok = await confirm({
      title: 'Excluir usuário',
      description: 'Tem certeza que deseja excluir permanentemente este usuário?',
      tone: 'danger',
      confirmLabel: 'Excluir',
    })
    if (!ok) return
    try {
      const res = await deleteUser(id)
      if (res && !res.success) throw new Error(res.error)
    } catch (err: any) {
      toast(err.message || 'Não foi possível excluir o usuário permanentemente.', 'error')
    }
  }

  const closeForm = () => {
    setIsAdding(false)
    setEditingUser(null)
    setError('')
  }

  return (
    <>
      {ConfirmDialogElement}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Usuários</h1>
          <p className="text-xs text-[var(--text-muted)]">Gerencie os usuários e seus acessos</p>
        </div>
        <div className="flex items-center w-full sm:w-auto">
          {(!isAdding && !editingUser) && (
            <button className="btn-primary rounded-[var(--radius-field)] px-4 py-2 w-full sm:w-auto" onClick={() => setIsAdding(true)}>+ Novo Usuário</button>
          )}
        </div>
      </div>

      {(isAdding || editingUser) && (
        <form onSubmit={handleSave} className="card-glass p-8 relative rounded-[var(--radius-box)] mb-8">
          <h3 className="text-xl font-semibold mb-6 border-b border-[var(--color-base-300)] pb-4">
            {editingUser ? 'Editar Usuário' : 'Criar Usuário'}
          </h3>

          {error && <div className="mb-4 p-3 rounded-[var(--radius-field)] bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)] text-sm font-medium">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Nome</label>
              <input name="nome" required className="input-field" defaultValue={editingUser?.nome} />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">E-mail</label>
              <input type="email" name="email" required className="input-field" defaultValue={editingUser?.email} />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Senha {editingUser && <span className="text-xs text-[var(--text-muted)] block">(Deixe em branco p/ manter)</span>}</label>
              <input type="password" name="senha" required={!editingUser} className="input-field" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Cargo / Função</label>
              <Select
                value={selectedRoleId}
                onChange={setSelectedRoleId}
                options={initialRoles.map(r => ({ value: r.id, label: r.nome }))}
                placeholder="Selecione uma função"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-6 border-t border-[var(--color-base-300)]">
            <button type="button" className="px-6 py-2 rounded-[var(--radius-field)] font-medium text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--color-base-200)] transition-colors" onClick={closeForm}>Cancelar</button>
            <button type="submit" className="btn-primary rounded-[var(--radius-field)] px-8 py-2" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Usuário'}
            </button>
          </div>
        </form>
      )}

      {(!isAdding && !editingUser) && (
        <div className="w-full overflow-x-auto md:overflow-visible md:rounded-[var(--radius-box)] md:border md:border-[var(--color-base-300)] max-h-[500px] overflow-y-auto">
          <table className="table table-hover data-table w-full block md:table md:min-w-[700px]">
            <thead className="hidden md:table-header-group">
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Perfil</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group">
              {initialUsers.length === 0 ? (
                <tr className="block md:table-row">
                  <td colSpan={4} className="block md:table-cell text-center py-12">
                    <p className="text-[var(--text-muted)] font-medium mb-4">Nenhum usuário encontrado no sistema.</p>
                    <button className="btn btn-secondary rounded-[var(--radius-field)] px-4 py-2 text-sm" onClick={() => setIsAdding(true)}>
                      Adicione um usuário para começar
                    </button>
                  </td>
                </tr>
              ) : (
                initialUsers.map((u) => (
                  <tr key={u.id} className="flex flex-col bg-transparent py-4 border-b border-[var(--color-base-300)] last:border-b-0 md:table-row md:py-0 md:hover:bg-[var(--color-base-200)] transition-colors">
                    <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4 font-semibold">
                      <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Nome</span>
                      <span>{u.nome}</span>
                    </td>
                    <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4 text-[var(--text-muted)]">
                      <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Email</span>
                      <span>{u.email}</span>
                    </td>
                    <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4">
                      <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Perfil</span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium border bg-[var(--primary-soft)] text-[var(--primary-color)] border-[var(--border-tint)]">
                        {u.role_nome.toUpperCase()}
                      </span>
                    </td>
                    <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4 md:text-right">
                      <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Ações</span>
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => setEditingUser(u)} className="px-3 py-1.5 rounded-[var(--radius-field)] text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors">Editar</button>
                        <button onClick={() => handleDelete(u.id)} className="px-3 py-1.5 rounded-[var(--radius-field)] text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors">Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
