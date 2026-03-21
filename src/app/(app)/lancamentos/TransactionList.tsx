'use client'

import { useState, useEffect } from 'react'
import { deleteTransaction } from '@/app/actions/finance'
import NewTransactionModal from '@/components/NewTransactionModal'
import { Plus } from 'lucide-react'

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
  userPermissions,
  headerSlot
}: {
  entradas: TransactionData[]
  saidas: TransactionData[]
  lookups: { categorias: Lookup[], cultos: Lookup[] }
  userPermissions: string[]
  headerSlot?: React.ReactNode
}) {
  const [editingTx, setEditingTx] = useState<TransactionData | null>(null)
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)

  const canEdit = userPermissions.includes('lancamentos.editar')
  const canDelete = userPermissions.includes('lancamentos.excluir')
  const canCreate = userPermissions.includes('lancamentos.criar')
  const canAct = canEdit || canDelete

  // Combine and sort transactions chronologically mapping directly from db props
  const allDbTransactions = [...entradas, ...saidas].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  )

  const [optimisticTxs, setOptimisticTxs] = useState<TransactionData[]>(allDbTransactions)

  // Sync to database reality when props strictly change
  useEffect(() => {
    setOptimisticTxs(allDbTransactions)
  }, [entradas, saidas])

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lançamento?')) {
      // Optimistic delete
      setOptimisticTxs((prev) => prev.filter(t => t.id !== id))
      try {
        const res = await deleteTransaction(id)
        if (!res.success) throw new Error(res.error || 'Não foi possível excluir este lançamento.')
      } catch (err: any) {
        alert(err.message || 'Operação cancelada: erro inesperado.')
        setOptimisticTxs(allDbTransactions) // Revert on fail
      }
    }
  }

  const handleUpdateOptimistic = (tx: Partial<TransactionData>, isNew = false) => {
    if (isNew) {
      const dummy: TransactionData = {
          id: 'temp-' + Date.now(),
          data: new Date(tx.data as any),
          descricao: tx.descricao!,
          valor: tx.valor!,
          tipo: tx.tipo!,
          categoria_id: tx.categoria_id,
          culto_id: tx.culto_id,
          categoria: lookups.categorias.find(c => c.id === tx.categoria_id) || null,
          culto: lookups.cultos.find(c => c.id === tx.culto_id) || null
      }
      setOptimisticTxs(prev => [...prev, dummy].sort(
          (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
      ))
    } else {
      setOptimisticTxs(prev => prev.map(t => {
          if (t.id === tx.id) {
              return {
                  ...t,
                  descricao: tx.descricao!,
                  valor: tx.valor!,
                  data: new Date(tx.data as any),
                  tipo: tx.tipo!,
                  categoria_id: tx.categoria_id,
                  culto_id: tx.culto_id,
                  categoria: lookups.categorias.find(c => c.id === tx.categoria_id) || null,
                  culto: lookups.cultos.find(c => c.id === tx.culto_id) || null
              }
          }
          return t
      }).sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()))
    }
  }

  let currentBalance = 0
  const transactionsWithBalance = optimisticTxs.map((t) => {
    if (t.tipo === 'ENTRADA') {
      currentBalance += t.valor
    } else {
      currentBalance -= t.valor
    }
    return { ...t, balance: currentBalance }
  })

  // Optionally show newest first after cumulative processing
  const displayTransactions = [...transactionsWithBalance].reverse()

  const renderTimeline = () => {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-3">
          Extrato Financeiro
        </h2>
        <div className="card overflow-hidden max-h-[420px] overflow-y-auto">
          <div className="table-responsive">
            <table className="table table-hover data-table">
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
                    <td colSpan={canAct ? 8 : 7} style={{ textAlign: 'center', padding: 'var(--spacing-2xl) 0' }}>
                      <p style={{ color: 'var(--text-muted)', fontWeight: 500, marginBottom: 'var(--spacing-md)' }}>Nenhum lançamento encontrado neste período.</p>
                      {canCreate && (
                        <button className="btn btn-secondary btn-sm" onClick={() => setIsNewModalOpen(true)}>
                          <Plus size={16} /> Adicione um lançamento para começar
                        </button>
                      )}
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
                            className={`badge badge-soft ${isEntrada ? 'badge-success' : 'badge-error'}`}
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
                                className="btn btn-soft btn-primary btn-sm" 
                                onClick={() => setEditingTx(t)}
                              >
                                Editar
                              </button>
                            )}
                            {canDelete && (
                              <button 
                                className="btn btn-soft btn-error btn-sm"
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-3">Lançamentos</h1>
          <p className="text-xs opacity-70" style={{ margin: 'var(--space-1) 0 0 0' }}>Registro e acompanhamento de transações financeiras</p>
        </div>
        <div className="flex items-center gap-3">
          {headerSlot}
          {canCreate && (
            <button className="btn btn-primary" onClick={() => setIsNewModalOpen(true)}>
              <Plus size={20} /> Novo lançamento
            </button>
          )}
        </div>
      </div>

      <NewTransactionModal 
        isOpen={isNewModalOpen} 
        onClose={() => setIsNewModalOpen(false)} 
        onSuccess={() => setIsNewModalOpen(false)} 
        lookups={lookups} 
        onSaveOptimistic={(tx) => handleUpdateOptimistic(tx, true)}
        onErrorRevert={() => setOptimisticTxs(allDbTransactions)}
      />

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
        onSaveOptimistic={(tx) => handleUpdateOptimistic(tx, false)}
        onErrorRevert={() => setOptimisticTxs(allDbTransactions)}
      />
      <div style={{ paddingBottom: 'var(--spacing-2xl)' }}>
        {renderTimeline()}
      </div>
    </>
  )
}
