'use client'

import { useState } from 'react'
import { createTransaction, updateTransaction } from '@/app/actions/finance'

type Lookup = { id: string; nome: string; tipo?: string }

export default function TransactionForm({ 
  lookups, 
  tipo,
  onSuccess,
  onCancel,
  initialData
}: { 
  lookups: { categorias: Lookup[], cultos: Lookup[] },
  tipo: 'ENTRADA' | 'SAIDA',
  onSuccess: () => void,
  onCancel: () => void,
  initialData?: {
    id: string
    descricao: string
    valor: number
    data: string
    categoria_id?: string | null
    culto_id?: string | null
  }
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    
    try {
      if (initialData) {
        await updateTransaction(initialData.id, {
          descricao: formData.get('descricao') as string,
          valor: parseFloat(formData.get('valor') as string),
          data: formData.get('data') as string,
          tipo: tipo,
          categoria_id: formData.get('categoria_id') as string || null,
          culto_id: (tipo === 'ENTRADA') ? (formData.get('culto_id') as string || null) : null,
        })
      } else {
        await createTransaction({
          descricao: formData.get('descricao') as string,
          valor: parseFloat(formData.get('valor') as string),
          data: formData.get('data') as string,
          tipo: tipo,
          categoria_id: formData.get('categoria_id') as string || null,
          culto_id: (tipo === 'ENTRADA') ? (formData.get('culto_id') as string || null) : null,
        })
      }
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar lançamentos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="transaction-form card" style={{ borderTop: `4px solid ${tipo === 'ENTRADA' ? 'var(--success)' : 'var(--danger)'}` }}>
      <h3 style={{ marginBottom: 'var(--spacing-md)' }}>
        {tipo === 'ENTRADA' ? 'Nova Entrada' : 'Nova Saída'}
      </h3>
      
      {error && <div style={{ color: 'var(--danger)', marginBottom: 'var(--spacing-sm)' }}>{error}</div>}

      <div className="input-group">
        <label className="input-label">Descrição</label>
        <input name="descricao" required className="input-field" placeholder="Ex: Oferta de Domingo" defaultValue={initialData?.descricao} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
        <div className="input-group">
          <label className="input-label">Data</label>
          <input type="date" name="data" required className="input-field" defaultValue={initialData?.data || new Date().toISOString().split('T')[0]} />
        </div>
        
        <div className="input-group">
          <label className="input-label">Valor (R$)</label>
          <input type="number" step="0.01" min="0" name="valor" required className="input-field" placeholder="0.00" defaultValue={initialData?.valor} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: tipo === 'ENTRADA' ? '1fr 1fr' : '1fr', gap: 'var(--spacing-md)' }}>
        <div className="input-group">
          <label className="input-label">Categoria</label>
          <select name="categoria_id" className="input-field" defaultValue={initialData?.categoria_id || ''}>
            <option value="">Nenhuma</option>
            {lookups.categorias
              .filter(c => c.tipo === tipo || c.tipo === 'AMBOS')
              .map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>

        {tipo === 'ENTRADA' && (
          <div className="input-group">
            <label className="input-label">Culto (Opcional)</label>
            <select name="culto_id" className="input-field" defaultValue={initialData?.culto_id || ''}>
              <option value="">Nenhum</option>
              {lookups.cultos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end', marginTop: 'var(--spacing-md)' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : `Salvar ${tipo === 'ENTRADA' ? 'Entrada' : 'Saída'}`}
        </button>
      </div>
    </form>
  )
}
