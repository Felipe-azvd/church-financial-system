'use client'

import { useState, useEffect } from 'react'
import { deleteTransaction } from '@/app/actions/finance'
import NewTransactionModal from '@/components/NewTransactionModal'
import { Plus } from 'lucide-react'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'

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
  const { confirm, ConfirmDialogElement } = useConfirm()
  const { toast } = useToast()

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
    const ok = await confirm({
      title: 'Excluir lançamento',
      description: 'Tem certeza que deseja excluir este lançamento?',
      tone: 'danger',
      confirmLabel: 'Excluir',
    })
    if (!ok) return

    setOptimisticTxs((prev) => prev.filter(t => t.id !== id))
    try {
      const res = await deleteTransaction(id)
      if (!res.success) throw new Error(res.error || 'Não foi possível excluir este lançamento.')
    } catch (err: any) {
      toast(err.message || 'Operação cancelada: erro inesperado.', 'error')
      setOptimisticTxs(allDbTransactions) // Revert on fail
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
        <div className="w-full overflow-hidden max-h-[500px] overflow-y-auto md:rounded-2xl md:border md:border-[var(--border-tint)] md:bg-[var(--surface-tint)] md:shadow-sm">
          <div className="w-full overflow-x-auto md:overflow-visible">
            <table className="table table-hover data-table w-full block md:table md:min-w-[800px]">
              <thead className="hidden md:table-header-group">
                <tr>
                  <th className="text-[var(--primary-color)]">Data</th>
                  <th className="text-[var(--primary-color)]">Descrição</th>
                  <th className="text-[var(--primary-color)]">Categoria</th>
                  <th className="text-[var(--primary-color)]">Culto</th>
                  <th className="text-[var(--primary-color)] text-center">Tipo</th>
                  <th className="text-[var(--primary-color)] text-right">Valor</th>
                  <th className="text-[var(--primary-color)] text-right">Saldo Corrente</th>
                  {canAct && <th className="text-[var(--primary-color)] text-center">Ações</th>}
                </tr>
              </thead>
              <tbody className="block md:table-row-group">
                {displayTransactions.length === 0 ? (
                  <tr className="block md:table-row">
                    <td colSpan={canAct ? 8 : 7} style={{ padding: '3rem 1rem' }} className="block md:table-cell text-center">
                      <p className="text-[var(--text-muted)] font-medium mb-4">Nenhum lançamento encontrado neste período.</p>
                      {canCreate && (
                        <div className="flex justify-center">
                          <button className="btn-primary !rounded-lg px-4 py-2" onClick={() => setIsNewModalOpen(true)}>
                            <span className="flex items-center gap-2">
                              <Plus size={16} /> Adicione um lançamento para começar
                            </span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  displayTransactions.map((t) => {
                    const isEntrada = t.tipo === 'ENTRADA'
                    const colorVar = isEntrada ? 'var(--color-success)' : 'var(--color-error)'
                    return (
                      <tr key={t.id} className="flex flex-col bg-transparent py-4 border-b border-[var(--color-base-300)] last:border-b-0 md:table-row md:py-0 md:hover:bg-[var(--color-base-200)] transition-colors">
                        <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4 whitespace-nowrap">
                          <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Data</span>
                          <span>{new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                        </td>
                        <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4 font-semibold text-right md:text-left">
                          <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Descrição</span>
                          <span>{t.descricao}</span>
                        </td>
                        <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4 text-[var(--text-muted)] text-right md:text-left">
                          <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Categoria</span>
                          <span>{t.categoria?.nome || '-'}</span>
                        </td>
                        <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4 text-[var(--text-muted)] text-right md:text-left">
                          <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Culto</span>
                          <span>{t.culto?.nome || '-'}</span>
                        </td>
                        <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4 md:text-center">
                          <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Tipo</span>
                          <span
                            className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium border"
                            style={{ backgroundColor: `color-mix(in oklab, ${colorVar} 10%, transparent)`, color: colorVar, borderColor: `color-mix(in oklab, ${colorVar} 20%, transparent)` }}
                          >
                            {isEntrada ? 'Entrada' : 'Saída'}
                          </span>
                        </td>
                        <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4 md:text-right font-semibold tabular-nums whitespace-nowrap" style={{ color: colorVar }}>
                          <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Valor</span>
                          <span>{isEntrada ? '+' : '-'} R$ {t.valor.toFixed(2).replace('.', ',')}</span>
                        </td>
                        <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4 md:text-right font-semibold tabular-nums whitespace-nowrap">
                          <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Saldo</span>
                          <span>R$ {t.balance.toFixed(2).replace('.', ',')}</span>
                        </td>
                        {canAct && (
                          <td className="flex justify-between items-center py-4 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4 md:text-center">
                            <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Ações</span>
                            <div className="flex items-center gap-2 justify-end md:justify-center">
                              {canEdit && (
                                <button className="px-3 py-1.5 rounded-[var(--radius-field)] text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors" onClick={() => setEditingTx(t)}>
                                  Editar
                                </button>
                              )}
                              {canDelete && (
                                <button className="px-3 py-1.5 rounded-[var(--radius-field)] text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors" onClick={() => handleDelete(t.id)}>
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
      {ConfirmDialogElement}
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