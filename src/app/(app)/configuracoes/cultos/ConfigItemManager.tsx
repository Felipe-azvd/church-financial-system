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
    /* Trocamos 'card' por 'card-glass' e adicionamos 'p-6' para o respiro interno perfeito */
    <div className="card-glass w-full p-6 rounded-2xl relative">
      
      {/* Cabeçalho Ajustado */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {!isAdding && !editingItem && (
          <button 
            className="btn-primary !rounded-lg px-5 py-2 text-sm font-medium" 
            onClick={() => setIsAdding(true)}
          >
            + Adicionar
          </button>
        )}
      </div>

      {/* Formulário de Adição/Edição com fundo destacado */}
      {(isAdding || editingItem) && (
        <form 
          onSubmit={handleSave} 
          className="flex flex-wrap items-center gap-4 mb-6 bg-black/20 p-5 rounded-xl border border-white/10 animate-[fadeIn_0.2s_ease-out]"
        >
          <input 
            name="nome" 
            required 
            className="input-field bg-black/20 text-white focus:border-[#3b82f6] transition-all h-[42px] px-4" 
            style={{ flex: 1, minWidth: '200px' }} 
            placeholder="Nome..." 
            defaultValue={editingItem?.nome}
            autoFocus 
          />
          {type === 'categoria' && (
            <select 
              name="itemTipo" 
              required 
              className="input-field bg-black/20 text-white focus:border-[#3b82f6] transition-all h-[42px] px-4" 
              style={{ width: '150px' }}
              defaultValue={editingItem?.tipo || 'AMBOS'}
            >
              <option value="AMBOS">Ambos</option>
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saída</option>
            </select>
          )}
          
          <div className="flex items-center gap-2">
            <button type="submit" className="btn-primary !rounded-lg px-6 py-2 h-[42px] flex items-center justify-center" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <button 
              type="button" 
              className="px-4 py-2 h-[42px] rounded-lg font-medium text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-all" 
              onClick={cancelAction}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Tabela de Listagem */}
      {(!isAdding && !editingItem) && (
        <div className="md:overflow-x-auto md:overflow-visible md:rounded-xl md:border md:border-white/5">
          <table className="table table-hover data-table w-full block md:table">
            <thead className="hidden md:table-header-group">
              <tr>
                <th className="!bg-black/20 !text-blue-400 font-semibold">{type === 'categoria' ? 'Categoria' : 'Nome'}</th>
                {type === 'categoria' && <th className="!bg-black/20 !text-blue-400 font-semibold">Tipo</th>}
                <th className="!bg-black/20 !text-blue-400 font-semibold text-right">Ações</th>
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
                items.map(item => {
                  return (
                    <tr key={item.id} className="flex flex-col bg-transparent py-4 border-b border-white/5 last:border-b-0 md:table-row md:py-0 md:border-white/5 md:hover:bg-white/5 transition-colors">
                      <td className="flex justify-between items-center py-2 border-b border-white/5 last:border-b-0 md:table-cell md:border-none md:py-4 font-medium text-white whitespace-normal break-words">
                        <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">{type === 'categoria' ? 'Categoria' : 'Nome'}</span>
                        <span className="text-right md:text-left">{item.nome}</span>
                      </td>
                      
                      {type === 'categoria' && (
                        <td className="flex justify-between items-center py-2 border-b border-white/5 last:border-b-0 md:table-cell md:border-none md:py-4 whitespace-normal break-words">
                          <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Tipo</span>
                          <div>
                            {item.tipo === 'ENTRADA' && <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">Entrada</span>}
                            {item.tipo === 'SAIDA' && <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20">Saída</span>}
                            {(!item.tipo || item.tipo === 'AMBOS') && <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">Ambos</span>}
                          </div>
                        </td>
                      )}
                      
                      <td className="flex justify-between items-center py-2 border-b border-white/5 last:border-b-0 md:table-cell md:border-none md:py-4 md:text-right whitespace-normal break-words">
                        <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Ações</span>
                        <div className="flex items-center gap-2 justify-end">
                          <button 
                            onClick={() => setEditingItem(item)} 
                            className="px-3 py-1.5 rounded-lg text-sm font-medium text-blue-400 hover:bg-blue-500/10 transition-colors"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)} 
                            className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                          >
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
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}