'use client'

import { useState } from 'react'
import { createConfigItem, updateConfigItem, deleteConfigItem } from '@/app/actions/config'

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
    if (confirm('Tem certeza que deseja remover este item?')) {
      await deleteConfigItem(type, id)
    }
  }

  const cancelAction = () => {
    setIsAdding(false)
    setEditingItem(null)
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <h2 style={{ fontSize: '1.25rem' }}>{title}</h2>
        {!isAdding && !editingItem && (
          <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => setIsAdding(true)}>Adicionar</button>
        )}
      </div>

      {(isAdding || editingItem) && (
        <form onSubmit={handleSave} style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap' }}>
          <input 
            name="nome" 
            required 
            className="input input-field" 
            style={{ flex: 1, minWidth: '200px' }} 
            placeholder="Nome..." 
            defaultValue={editingItem?.nome}
            autoFocus 
          />
          {type === 'categoria' && (
            <select 
              name="itemTipo" 
              required 
              className="select input-field" 
              style={{ width: '150px' }}
              defaultValue={editingItem?.tipo || 'AMBOS'}
            >
              <option value="AMBOS">Ambos</option>
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saída</option>
            </select>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '...' : 'Salvar'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={cancelAction}>Cancelar</button>
        </form>
      )}

      {(!isAdding && !editingItem) && (
        <div style={{ overflowX: 'auto' }}>
          <table className="table table-hover data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>{type === 'categoria' ? 'Categoria' : 'Nome'}</th>
                {type === 'categoria' && <th>Tipo</th>}
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={type === 'categoria' ? 3 : 2} style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--spacing-md)' }}>
                    Nenhum item cadastrado
                  </td>
                </tr>
              ) : (
                items.map(item => {
                  let badgeData = { bg: 'transparent', label: '' }
                  if (item.tipo === 'ENTRADA') badgeData = { bg: 'var(--success)', label: 'Entrada' }
                  else if (item.tipo === 'SAIDA') badgeData = { bg: 'var(--danger)', label: 'Saída' }
                  else if (item.tipo === 'AMBOS') badgeData = { bg: 'var(--accent-primary)', label: 'Ambos' }

                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 500 }}>{item.nome}</td>
                      {type === 'categoria' && (
                        <td>
                          {item.tipo ? (
                            <span className={`badge badge-soft ${item.tipo === 'ENTRADA' ? 'badge-success' : item.tipo === 'SAIDA' ? 'badge-error' : 'badge-info'}`}>
                              {badgeData.label}
                            </span>
                          ) : '-'}
                        </td>
                      )}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
                          <button onClick={() => setEditingItem(item)} className="btn btn-soft btn-primary btn-sm">
                            Editar
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="btn btn-soft btn-error btn-sm">
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
