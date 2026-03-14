'use client'

import { useState, useEffect, useRef } from 'react'
import { createTransaction, updateTransaction } from '@/app/actions/finance'

type Lookup = { id: string; nome: string; tipo?: string }

export type TransactionEditData = {
  id: string
  descricao: string
  valor: number
  data: string
  tipo: string
  categoria_id?: string | null
  culto_id?: string | null
}

export default function NewTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  lookups,
  transaction
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  lookups: { categorias: Lookup[]; cultos: Lookup[] }
  transaction?: TransactionEditData | null
}) {
  const [tipo, setTipo] = useState<'ENTRADA' | 'SAIDA'>('ENTRADA')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [quickEntry, setQuickEntry] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [cultoId, setCultoId] = useState('')
  const [dataString, setDataString] = useState(new Date().toISOString().split('T')[0])
  const [valorRaw, setValorRaw] = useState<number>(0)
  const [valorDisplay, setValorDisplay] = useState<string>('')
  const valorInputRef = useRef<HTMLInputElement>(null)

  // Load initial data if editing, or reset if creating
  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        setTipo(transaction.tipo as 'ENTRADA' | 'SAIDA')
        setValorRaw(transaction.valor)
        setValorDisplay(formatCurrency(transaction.valor))
        setDescricao(transaction.descricao)
        setCategoriaId(transaction.categoria_id || '')
        setCultoId(transaction.culto_id || '')
        setDataString(transaction.data)
      } else {
        setTipo('ENTRADA')
        setValorRaw(0)
        setValorDisplay('')
        setDescricao('')
        setCategoriaId('')
        setCultoId('')
        setQuickEntry('')
        setDataString(new Date().toISOString().split('T')[0])
      }
      setSuccessMsg('')
      setError('')
    }
  }, [isOpen, transaction])

  const normalize = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  }

  const handleQuickEntry = (text: string) => {
    if (!text.trim()) return

    const tokens = text.trim().split(/\s+/)
    if (tokens.length === 0) return

    // Extract first number
    const numericTokenIndex = tokens.findIndex(t => /^\d+(?:[.,]\d+)?$/.test(t))
    
    if (numericTokenIndex !== -1) {
      const rawVal = tokens[numericTokenIndex].replace(',', '.')
      const numericValue = parseFloat(rawVal)
      if (!isNaN(numericValue) && numericValue > 0) {
        setValorRaw(numericValue)
        setValorDisplay(formatCurrency(numericValue))
      }

      const remainingTokens = tokens.filter((_, idx) => idx !== numericTokenIndex)
      
      if (remainingTokens.length > 0) {
        let matchedCatId = ''
        let catTokenMatched = ''
        
        const catToken = remainingTokens[0]
        if (catToken) {
          const normalizedToken = normalize(catToken)
          const validCats = lookups.categorias.filter(c => c.tipo === tipo || c.tipo === 'AMBOS')
          
          let partialCat = validCats.find(c => normalize(c.nome).startsWith(normalizedToken))
          if (!partialCat) {
            partialCat = validCats.find(c => normalize(c.nome).includes(normalizedToken))
          }

          if (partialCat) {
            matchedCatId = partialCat.id
            catTokenMatched = catToken
          }
        }
        setCategoriaId(matchedCatId)

        let matchedCultoId = ''
        let cultoTokenMatched = ''

        // Search for culto in the tokens after the category token
        const potentialCultoTokens = remainingTokens.slice(1)
        for (const token of potentialCultoTokens) {
          const normalizedCultoToken = normalize(token)
          let partialCulto = lookups.cultos.find(c => normalize(c.nome).startsWith(normalizedCultoToken))
          if (!partialCulto) {
            partialCulto = lookups.cultos.find(c => normalize(c.nome).includes(normalizedCultoToken))
          }
          
          if (partialCulto) {
            matchedCultoId = partialCulto.id
            cultoTokenMatched = token
            break
          }
        }
        setCultoId(matchedCultoId)

        // Description becomes the remaining text, minus the matched tokens to keep it clean
        let descTokens = [...remainingTokens]
        if (catTokenMatched) {
          descTokens = descTokens.filter(t => t !== catTokenMatched)
        }
        if (cultoTokenMatched) {
          descTokens = descTokens.filter(t => t !== cultoTokenMatched)
        }
        setDescricao(descTokens.join(' '))
      }
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Format value as local currency when typing
  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (!value) {
      setValorRaw(0)
      setValorDisplay('')
      return
    }
    const numericValue = parseInt(value, 10) / 100
    setValorRaw(numericValue)
    setValorDisplay(formatCurrency(numericValue))
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
    
    if (valorRaw <= 0) {
      setError('O valor deve ser maior que zero')
      return
    }

    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    try {
      const payload = {
        descricao: formData.get('descricao') as string,
        valor: valorRaw,
        data: formData.get('data') as string,
        tipo: tipo,
        categoria_id: formData.get('categoria_id') as string || null,
        culto_id: (tipo === 'ENTRADA') ? (formData.get('culto_id') as string || null) : null,
      }
      
      if (transaction) {
        await updateTransaction(transaction.id, payload)
        setSuccessMsg('✓ Lançamento atualizado com sucesso')
      } else {
        await createTransaction(payload)
        setSuccessMsg('✓ Lançamento salvo com sucesso')
      }

      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1000)
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
        <h2 style={{ marginBottom: 'var(--spacing-lg)', marginTop: 0, color: 'var(--text-primary)' }}>
          {transaction ? 'Editar lançamento' : 'Novo lançamento'}
        </h2>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: 'var(--spacing-sm)', padding: 'var(--spacing-xs)', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)' }}>{error}</div>}
        {successMsg && <div style={{ color: 'var(--success)', marginBottom: 'var(--spacing-sm)', padding: 'var(--spacing-xs)', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>{successMsg}</div>}

        <div className="input-group" style={{ marginBottom: 'var(--spacing-md)' }}>
          <label className="input-label" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Entrada rápida</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Ex: 50 oferta" 
            value={quickEntry}
            onChange={(e) => setQuickEntry(e.target.value)}
            onBlur={() => handleQuickEntry(quickEntry)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleQuickEntry(quickEntry)
              }
            }}
            style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.3)' }}
          />
        </div>

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
          
          <div className="grid grid-cols-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)' }}>
            <div className="input-group col-span-1" style={{ gridColumn: 'span 1 / span 1' }}>
              <label className="input-label">Data</label>
              <input type="date" name="data" required className="input-field w-full" style={{ width: '100%' }} value={dataString} onChange={e => setDataString(e.target.value)} />
            </div>
            
            <div className="input-group col-span-2" style={{ gridColumn: 'span 2 / span 2' }}>
              <label className="input-label" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Valor (R$)</label>
              <input 
                ref={valorInputRef}
                type="text" 
                value={valorDisplay}
                onChange={handleValorChange}
                required 
                className="input-field" 
                placeholder="R$ 0,00" 
                style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 700, 
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  borderColor: tipo === 'ENTRADA' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)',
                  borderWidth: '2px',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Descrição</label>
            <input name="descricao" required className="input-field" placeholder="Ex: Oferta de Domingo, Conta de Luz..." value={descricao} onChange={e => setDescricao(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <div className="input-group">
              <label className="input-label">Categoria</label>
              <select name="categoria_id" className="input-field" value={categoriaId} onChange={e => setCategoriaId(e.target.value)}>
                <option value="">Nenhuma</option>
                {lookups.categorias
                  .filter(c => c.tipo === tipo || c.tipo === 'AMBOS')
                  .map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>

            {tipo === 'ENTRADA' && (
              <div className="input-group">
                <label className="input-label">Culto (Opcional)</label>
                <select name="culto_id" className="input-field" value={cultoId} onChange={e => setCultoId(e.target.value)}>
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
              {loading ? 'Salvando...' : (transaction ? 'Salvar alterações' : 'Salvar lançamento')}
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
