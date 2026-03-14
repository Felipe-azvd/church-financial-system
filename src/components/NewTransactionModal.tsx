'use client'

import { useState, useEffect, useRef } from 'react'
import { createTransaction } from '@/app/actions/finance'

type Lookup = { id: string; nome: string; tipo?: string }

export default function NewTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  lookups,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  lookups: { categorias: Lookup[]; cultos: Lookup[] }
}) {
  const [tipo, setTipo] = useState<'ENTRADA' | 'SAIDA'>('ENTRADA')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const valorInputRef = useRef<HTMLInputElement>(null)

  // Format value as local currency when typing
  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value) {
      value = (parseInt(value, 10) / 100).toFixed(2)
    }
    e.target.value = value
  }

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Focus on the first input ("Valor") when modal opens
  useEffect(() => {
    if (isOpen && valorInputRef.current) {
      setTimeout(() => valorInputRef.current?.focus(), 50)
    }
  }, [isOpen, tipo])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    try {
      await createTransaction({
        descricao: formData.get('descricao') as string,
        valor: parseFloat(formData.get('valor') as string),
        data: formData.get('data') as string,
        tipo: tipo,
        categoria_id: formData.get('categoria_id') as string || null,
        culto_id: (tipo === 'ENTRADA') ? (formData.get('culto_id') as string || null) : null,
      })
      onSuccess()
      onClose()
      // reset form state maybe? 
      setTipo('ENTRADA')
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar lançamentos')
    } finally {
      setLoading(false)
    }
  }

  // Common UI styles
  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    animation: 'fadeIn 0.2s ease-out'
  }

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-xl)',
    width: '90%',
    maxWidth: '500px',
    boxShadow: 'var(--shadow-xl)',
    position: 'relative'
  }

  return (
    <div style={modalOverlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={modalContentStyle}>
        <h2 style={{ marginBottom: 'var(--spacing-lg)', marginTop: 0, color: 'var(--text-primary)' }}>Novo lançamento</h2>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: 'var(--spacing-sm)', padding: 'var(--spacing-xs)', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)' }}>{error}</div>}

        <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
          <button 
            type="button"
            style={{ flex: 1, padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)', border: tipo === 'ENTRADA' ? '2px solid var(--success)' : '1px solid var(--border-color)', backgroundColor: tipo === 'ENTRADA' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: tipo === 'ENTRADA' ? 'var(--success)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
            onClick={() => setTipo('ENTRADA')}
          >
            Entrada
          </button>
          <button 
            type="button"
            style={{ flex: 1, padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)', border: tipo === 'SAIDA' ? '2px solid var(--danger)' : '1px solid var(--border-color)', backgroundColor: tipo === 'SAIDA' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: tipo === 'SAIDA' ? 'var(--danger)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
            onClick={() => setTipo('SAIDA')}
          >
            Saída
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <div className="input-group">
              <label className="input-label">Data</label>
              <input type="date" name="data" required className="input-field" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            
            <div className="input-group">
              <label className="input-label">Valor (R$)</label>
              <input 
                ref={valorInputRef}
                type="number" 
                step="0.01" 
                min="0.01" 
                name="valor" 
                required 
                className="input-field" 
                placeholder="0.00" 
                style={{ fontSize: '1.2rem', fontWeight: 600 }}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Descrição</label>
            <input name="descricao" required className="input-field" placeholder="Ex: Oferta de Domingo, Conta de Luz..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <div className="input-group">
              <label className="input-label">Categoria</label>
              <select name="categoria_id" className="input-field">
                <option value="">Nenhuma</option>
                {lookups.categorias
                  .filter(c => c.tipo === tipo || c.tipo === 'AMBOS')
                  .map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>

            {tipo === 'ENTRADA' && (
              <div className="input-group">
                <label className="input-label">Culto (Opcional)</label>
                <select name="culto_id" className="input-field">
                  <option value="">Nenhum</option>
                  {lookups.cultos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
            )}

            {tipo === 'ENTRADA' && (
              <div className="input-group">
                <label className="input-label">Forma de Pagamento</label>
                <select name="payment_method" className="input-field">
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="PIX">PIX</option>
                  <option value="CARTAO">Cartão</option>
                  <option value="BOLETO">Boleto</option>
                  <option value="TRANSFERENCIA">Transferência</option>
                </select>
              </div>
            )}

            {tipo === 'SAIDA' && (
              <div className="input-group">
                <label className="input-label">Responsável</label>
                <input type="text" name="responsavel" className="input-field" placeholder="Nome do Responsável" />
              </div>
            )}
          </div>

          {tipo === 'SAIDA' && (
             <div className="input-group">
                <label className="input-label">Comprovante (Opcional)</label>
                <input type="file" name="comprovante" className="input-field" accept="image/*,.pdf" style={{ padding: '7px' }} />
              </div>
          )}

          <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end', marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ backgroundColor: tipo === 'ENTRADA' ? 'var(--success)' : 'var(--danger)', borderColor: tipo === 'ENTRADA' ? 'var(--success)' : 'var(--danger)' }}>
              {loading ? 'Salvando...' : 'Salvar lançamento'}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
