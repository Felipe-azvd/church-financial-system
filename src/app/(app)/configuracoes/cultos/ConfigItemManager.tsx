'use client'

import { useState } from 'react'
import { createConfigItem, updateConfigItem, deleteConfigItem } from '@/app/actions/config'
import { useConfirm } from '@/components/ui/ConfirmDialog'

type Item = { id: string; nome: string; tipo?: string }

export default function ConfigItemManager({
  title,
  type,
  items
}: {
  title: string,
  type: 'categoria' | 'culto',
  items: Item[]
}) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(false)
  const { confirm, ConfirmDialogElement } = useConfirm()

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const nome = formData.get('nome') as string
    const itemTipo = formData.get('itemTipo') as string | undefined

    if (editingItem) {
      await updateConfigItem(type, editingItem.id, nome, itemTipo)
      setEditingItem(null)
    } else {
      await createConfigItem(type, nome, itemTipo)
      setIsAdding(false)
    }

    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Remover item',
      description: 'Tem certeza que deseja remover este item?',
      tone: 'danger',
      confirmLabel: 'Remover',
    })
    if (ok) await deleteConfigItem(type, id)
  }

  const cancelAction = () => {
    setIsAdding(false)
    setEditingItem(null)
  }

  return (
    <div className="rounded-[var(--radius-box)] border border-[var(--color-base-300)] bg-[var(--color-base-100)] shadow-[var(--shadow-sm)] w-full p-6">
      {ConfirmDialogElement}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{title}</h2>
        {!isAdding && !editingItem && (
          <button
            className="btn-primary rounded-[var(--radius-field)] px-5 py-2 text-sm font-medium"
            onClick={() => setIsAdding(true)}
          >
            + Adicionar
          </button>
        )}
      </div>

      {(isAdding || editingItem) && (
        <form
          onSubmit={handleSave}
          className="flex flex-wrap items-center gap-4 mb-6 bg-[var(--color-base-200)] p-5 rounded-[var(--radius-box)] border border-[var(--color-base-300)]"
        >
          <input
            name="nome"
            required
            className="input-field"
            style={{ flex: 1, minWidth: '200px' }}
            placeholder="Nome..."
            defaultValue={editingItem?.nome}
            autoFocus
          />
          {type === 'categoria' && (
            <select
              name="itemTipo"
              required
              className="input-field"
              style={{ width: '150px' }}
              defaultValue={editingItem?.tipo || 'AMBOS'}
            >
              <option value="AMBOS">Ambos</option>
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saída</option>
            </select>
          )}

          <div className="flex items-center gap-2">
            <button type="submit" className="btn-primary rounded-[var(--radius-field)] px-6 py-2 h-[42px] flex items-center justify-center" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              className="px-4 py-2 h-[42px] rounded-[var(--radius-field)] font-medium text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--color-base-300)] transition-colors"
              onClick={cancelAction}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {(!isAdding && !editingItem) && (
        <div className="md:overflow-x-auto md:overflow-visible md:rounded-[var(--radius-box)] md:border md:border-[var(--color-base-300)]">
          <table className="table table-hover data-table w-full block md:table">
            <thead className="hidden md:table-header-group">
              <tr>
                <th>{type === 'categoria' ? 'Categoria' : 'Nome'}</th>
                {type === 'categoria' && <th>Tipo</th>}
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group">
              {items.length === 0 ? (
                <tr className="block md:table-row">
                  <td colSpan={type === 'categoria' ? 3 : 2} className="block md:table-cell text-center text-[var(--text-muted)] py-8 font-medium">
                    Nenhum item cadastrado.
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="flex flex-col bg-transparent py-4 border-b border-[var(--color-base-300)] last:border-b-0 md:table-row md:py-0 md:hover:bg-[var(--color-base-200)] transition-colors">
                    <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4 font-medium whitespace-normal break-words">
                      <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">{type === 'categoria' ? 'Categoria' : 'Nome'}</span>
                      <span className="text-right md:text-left">{item.nome}</span>
                    </td>

                    {type === 'categoria' && (
                      <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4 whitespace-normal break-words">
                        <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Tipo</span>
                        <div>
                          {item.tipo === 'ENTRADA' && <span className="px-3 py-1 rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)] text-xs font-medium border border-[var(--color-success)]/20">Entrada</span>}
                          {item.tipo === 'SAIDA' && <span className="px-3 py-1 rounded-full bg-[var(--color-error)]/10 text-[var(--color-error)] text-xs font-medium border border-[var(--color-error)]/20">Saída</span>}
                          {(!item.tipo || item.tipo === 'AMBOS') && <span className="px-3 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-medium border border-[var(--color-primary)]/20">Ambos</span>}
                        </div>
                      </td>
                    )}

                    <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4 md:text-right whitespace-normal break-words">
                      <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Ações</span>
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="px-3 py-1.5 rounded-[var(--radius-field)] text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1.5 rounded-[var(--radius-field)] text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
