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
  headerSlot,
  isMaster
}: {
  entradas: TransactionData[]
  saidas: TransactionData[]
  lookups: { categorias: Lookup[], cultos: Lookup[] }
  userPermissions: string[]
  headerSlot?: React.ReactNode
  isMaster?: boolean
}) {
  const [editingTx, setEditingTx] = useState<TransactionData | null>(null)
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)

  const canEdit = isMaster || userPermissions.includes('lancamentos.editar')
  const canDelete = isMaster || userPermissions.includes('lancamentos.excluir')
  const canCreate = isMaster || userPermissions.includes('lancamentos.criar')
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

  const displayTransactions = [...transactionsWithBalance].reverse()

  const renderTimeline = () => {
    return (
      <div className="w-full">
        <h2 className="text-lg font-semibold mb-3">
          Extrato Financeiro
        </h2>
        {/* CORREÇÃO 1: Fundo responsivo e rolagem para a tabela não estourar a tela */}
        <div className="w-full overflow-hidden max-h-[500px] overflow-y-auto rounded-2xl border border-[var(--border-tint)] bg-[var(--surface-tint)] shadow-sm">
          <div className="w-full overflow-x-auto">
            <table className="table table-hover data-table w-full min-w-[800px]">
              <thead>
                <tr>
                  <th className="!bg-[var(--surface-tint)] !text-[var(--primary-color)]">Data</th>
                  <th className="!bg-[var(--surface-tint)] !text-[var(--primary-color)]">Descrição</th>
                  <th className="!bg-[var(--surface-tint)] !text-[var(--primary-color)]">Categoria</th>
                  <th className="!bg-[var(--surface-tint)] !text-[var(--primary-color)]">Culto</th>
                  <th className="!bg-[var(--surface-tint)] !text-[var(--primary-color)]" style={{ textAlign: 'center' }}>Tipo</th>
                  <th className="!bg-[var(--surface-tint)] !text-[var(--primary-color)]" style={{ textAlign: 'right' }}>Valor</th>
                  <th className="!bg-[var(--surface-tint)] !text-[var(--primary-color)]" style={{ textAlign: 'right' }}>Saldo Corrente</th>
                  {canAct && <th className="!bg-[var(--surface-tint)] !text-[var(--primary-color)]" style={{ textAlign: 'center' }}>Ações</th>}
                </tr>
              </thead>
              <tbody>
                {displayTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={canAct ? 8 : 7} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                      <p className="text-[var(--text-muted)] font-medium mb-4">Nenhum lançamento encontrado neste período.</p>
                      {canCreate && (
                        <button className="btn-primary !rounded-lg px-4 py-2" onClick={() => setIsNewModalOpen(true)}>
                          <span className="flex items-center gap-2">
                            <Plus size={16} /> Adicione um lançamento para começar
                          </span>
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  displayTransactions.map((t) => {
                    const isEntrada = t.tipo === 'ENTRADA'
                    const color = isEntrada ? 'var(--success)' : 'var(--danger)'
                    return (
                      <tr key={t.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                        <td className="text-white whitespace-nowrap">{new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                        <td className="font-semibold text-white">{t.descricao}</td>
                        <td className="text-[var(--text-muted)]">{t.categoria?.nome || '-'}</td>
                        <td className="text-[var(--text-muted)]">{t.culto?.nome || '-'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium border"
                            style={{ 
                              backgroundColor: isEntrada ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: isEntrada ? '#10b981' : '#ef4444',
                              borderColor: isEntrada ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                            }}
                          >
                            {isEntrada ? 'Entrada' : 'Saída'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color, whiteSpace: 'nowrap' }}>
                          {isEntrada ? '+' : '-'} R$ {t.valor.toFixed(2).replace('.', ',')}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                          R$ {t.balance.toFixed(2).replace('.', ',')}
                        </td>
                        {canAct && (
                          <td style={{ textAlign: 'center' }}>
                            <div className="flex items-center gap-2 justify-center">
                              {canEdit && (
                                <button className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/10" style={{ color: 'var(--primary-color)' }} onClick={() => setEditingTx(t)}>
                                  Editar
                                </button>
                              )}
                              {canDelete && (
                                <button className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors" onClick={() => handleDelete(t.id)}>
                                  Excluir
                                </button>
                              )}
                            </div>
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
    <div className="w-full">
      {/* CORREÇÃO 2: Cabeçalho Empilhável (flex-col sm:flex-row) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 w-full">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Lançamentos</h1>
          <p className="text-xs opacity-70">Registro e acompanhamento de transações financeiras</p>
        </div>
        
        {/* Agrupamento dos controles: Seletor de mês e botão alinham juntos */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {headerSlot}
          {canCreate && (
            <button className="btn-primary !rounded-lg flex items-center justify-center gap-2 px-4 py-2 w-full sm:w-auto whitespace-nowrap" onClick={() => setIsNewModalOpen(true)}>
              <Plus size={20} /> <span className="hidden sm:inline">Novo lançamento</span><span className="sm:hidden">Lançamento</span>
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
      <div className="w-full pb-8">
        {renderTimeline()}
      </div>
    </div>
  )
}