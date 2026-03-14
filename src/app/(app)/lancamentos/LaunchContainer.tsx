'use client'

import { useState } from 'react'
import NewTransactionModal from '@/components/NewTransactionModal'
import { Plus } from 'lucide-react'

export default function LaunchContainer({ lookups, userPermissions }: { lookups: any, userPermissions: string[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!userPermissions.includes('lancamentos.criar')) {
    return null
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--spacing-xl)' }}>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Novo lançamento
        </button>
      </div>

      <NewTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false)
          // The actions will revalidate the page, so we just close the modal.
        }} 
        lookups={lookups} 
      />
    </>
  )
}
