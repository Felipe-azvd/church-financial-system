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

  // Combine and sort transactions chronologically (oldest first for running balance)
  const allTransactions = [...entradas, ...saidas].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  )

  let currentBalance = 0
  const transactionsWithBalance = allTransactions.map((t) => {
    if (t.tipo === 'ENTRADA') {
      currentBalance += t.valor
    } else {
      currentBalance -= t.valor
    }
    return { ...t, balance: currentBalance }
  })

  // Optionally, you might want to show them newest first for the user, 
  // so we reverse the array after calculating the running balance.
  const displayTransactions = [...transactionsWithBalance].reverse()

  const renderTimeline = () => {
    return (
      <div>
        <h2 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)', fontSize: '1.25rem' }}>
          Extrato Financeiro
        </h2>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Culto</th>
                  <th style={{ textAlign: 'center' }}>Tipo</th>
                  <th style={{ textAlign: 'right' }}>Valor</th>
                  <th style={{ textAlign: 'right' }}>Saldo Corrente</th>
                  {canAct && <th style={{ textAlign: 'center' }}>Ações</th>}
                </tr>
              </thead>
              <tbody>
                {displayTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={canAct ? 8 : 7} style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-muted)' }}>
                      Nenhum Lançamento neste mês.
                    </td>
                  </tr>
                ) : (
                  displayTransactions.map((t) => {
                    const isEntrada = t.tipo === 'ENTRADA'
                    const color = isEntrada ? 'var(--success)' : 'var(--danger)'
                    return (
                      <tr key={t.id}>
                        <td>{new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                        <td>{t.descricao}</td>
                        <td>{t.categoria?.nome || '-'}</td>
                        <td>{t.culto?.nome || '-'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span 
                            className={`badge ${isEntrada ? 'badge-success' : 'badge-danger'}`}
                          >
                            {isEntrada ? 'Entrada' : 'Saída'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color }}>
                          {isEntrada ? '+' : '-'} R$ {t.valor.toFixed(2).replace('.', ',')}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                          R$ {t.balance.toFixed(2).replace('.', ',')}
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
                    )
                  })
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
      <div style={{ paddingBottom: 'var(--spacing-2xl)' }}>
        {renderTimeline()}
      </div>
    </>
  )
}
