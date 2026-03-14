'use client'

import { useState } from 'react'
import TransactionForm from '@/components/TransactionForm'
import { Plus } from 'lucide-react'

export default function LaunchContainer({ lookups, userPermissions }: { lookups: any, userPermissions: string[] }) {
  const [modalType, setModalType] = useState<'ENTRADA' | 'SAIDA' | null>(null)

  if (!userPermissions.includes('lancamentos.criar')) {
    return null
  }

  if (modalType) {
    return (
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <TransactionForm 
          lookups={lookups} 
          tipo={modalType} 
          onSuccess={() => setModalType(null)} 
          onCancel={() => setModalType(null)}
        />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
      <button className="btn btn-primary" onClick={() => setModalType('ENTRADA')}>
        <Plus size={20} /> Nova Entrada
      </button>
      <button className="btn btn-secondary" style={{ backgroundColor: 'var(--danger)', color: 'white', borderColor: 'var(--danger)' }} onClick={() => setModalType('SAIDA')}>
        <Plus size={20} /> Nova Saída
      </button>
    </div>
  )
}
