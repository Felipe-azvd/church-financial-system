'use client'

import { useState } from 'react'
import { deleteTransaction } from '@/app/actions/finance'
import NewTransactionModal from '@/components/NewTransactionModal'

type Lookup = { id: string; nome: string; tipo?: string }

type TransactionData = {
  id: string
  data: Date
  descricao: string
  valor: number
  categoria?: { nome: string } | null
  categoria_id?: string | null
  culto?: { nome: string } | null
  culto_id?: string | null
  tipo: string
}

export default function TransactionList({
  entradas,
  saidas,
  lookups,
  userPermissions
}: {
  entradas: TransactionData[]
  saidas: TransactionData[]
  lookups: { categorias: Lookup[], cultos: Lookup[] }
  userPermissions: string[]
}) {
  const [editingTx, setEditingTx] = useState<TransactionData | null>(null)

  const canEdit = userPermissions.includes('lancamentos.editar')
  const canDelete = userPermissions.includes('lancamentos.excluir')
  const canAct = canEdit || canDelete

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lançamento?')) {
      try {
        await deleteTransaction(id)
      } catch (err) {
        alert('Erro ao excluir lançamento')
      }
    }
  }

  const renderTable = (transactions: TransactionData[], type: 'ENTRADA' | 'SAIDA') => {
    const isEntrada = type === 'ENTRADA'
    const color = isEntrada ? 'var(--success)' : 'var(--danger)'
    const title = isEntrada ? 'Entradas' : 'Saídas'
    
    return (
      <div>
        <h2 style={{ marginBottom: 'var(--spacing-md)', color, fontSize: '1.25rem' }}>{title}</h2>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  {isEntrada && <th>Culto</th>}
                  <th style={{ textAlign: 'right' }}>Valor</th>
                  {canAct && <th style={{ textAlign: 'center' }}>Ações</th>}
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={canAct ? (isEntrada ? 6 : 5) : (isEntrada ? 5 : 4)} style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-muted)' }}>
                      Nenhum Lançamento neste mês.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id}>
                      <td>{new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                      <td>{t.descricao}</td>
                      <td>{t.categoria?.nome || '-'}</td>
                      {isEntrada && <td>{t.culto?.nome || '-'}</td>}
                      <td style={{ textAlign: 'right', fontWeight: 600, color }}>
                        {isEntrada ? '+' : '-'} R$ {t.valor.toFixed(2).replace('.', ',')}
                      </td>
                      {canAct && (
                        <td style={{ textAlign: 'center' }}>
                          {canEdit && (
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '0.125rem 0.5rem', fontSize: '0.75rem', marginRight: '0.25rem' }}
                              onClick={() => setEditingTx(t)}
                            >
                              Editar
                            </button>
                          )}
                          {canDelete && (
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '0.125rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'transparent', background: 'transparent' }}
                              onClick={() => handleDelete(t.id)}
                            >
                              Excluir
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <NewTransactionModal 
        isOpen={!!editingTx}
        onClose={() => setEditingTx(null)}
        onSuccess={() => setEditingTx(null)}
        lookups={lookups} 
        transaction={editingTx ? {
          id: editingTx.id,
          descricao: editingTx.descricao,
          data: new Date(editingTx.data).toISOString().split('T')[0],
          valor: editingTx.valor,
          tipo: editingTx.tipo,
          categoria_id: editingTx.categoria_id,
          culto_id: editingTx.culto_id || ''
        } : null}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--spacing-xl)', alignItems: 'start' }}>
        {renderTable(entradas, 'ENTRADA')}
        {renderTable(saidas, 'SAIDA')}
      </div>
    </>
  )
}
