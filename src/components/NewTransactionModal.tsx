'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { createTransaction, updateTransaction } from '@/app/actions/finance'
import { UploadCloud, FileText } from 'lucide-react'

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
  transaction,
  onSaveOptimistic,
  onErrorRevert
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  lookups: { categorias: Lookup[]; cultos: Lookup[] }
  transaction?: TransactionEditData | null
  onSaveOptimistic?: (tx: any) => void
  onErrorRevert?: () => void
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

  // 1. Cache/Precompute normalized categories and cultos
  const normalizedCategorias = useMemo(() => {
    return lookups.categorias.map((c: any) => ({
      ...c,
      normalized: normalize(c.nome)
    }))
  }, [lookups.categorias])

  const normalizedCultos = useMemo(() => {
    return lookups.cultos.map((c: any) => ({
      ...c,
      normalized: normalize(c.nome)
    }))
  }, [lookups.cultos])

  const parseQuickEntry = useCallback((text: string) => {
    if (!text.trim()) return

    const tokens = text.trim().split(/\s+/)
    if (tokens.length === 0) return

    // Extract first number
    const numericTokenIndex = tokens.findIndex((t: string) => /^\d+(?:[.,]\d+)?$/.test(t))
    
    if (numericTokenIndex !== -1) {
      const rawVal = tokens[numericTokenIndex].replace(',', '.')
      const numericValue = parseFloat(rawVal)
      if (!isNaN(numericValue) && numericValue > 0) {
        setValorRaw(numericValue)
        setValorDisplay(formatCurrency(numericValue))
      }

      const remainingTokens = tokens.filter((_: any, idx: number) => idx !== numericTokenIndex)
      
      if (remainingTokens.length > 0) {
        let matchedCatId = ''
        let catTokenMatched = ''
        
        const catToken = remainingTokens[0]
        if (catToken) {
          const normalizedToken = normalize(catToken)
          const validCats = normalizedCategorias.filter((c: any) => c.tipo === tipo || c.tipo === 'AMBOS')
          
          let partialCat = validCats.find((c: any) => c.normalized.startsWith(normalizedToken))
          if (!partialCat) {
            partialCat = validCats.find((c: any) => c.normalized.includes(normalizedToken))
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
          let partialCulto = normalizedCultos.find((c: any) => c.normalized.startsWith(normalizedCultoToken))
          if (!partialCulto) {
            partialCulto = normalizedCultos.find((c: any) => c.normalized.includes(normalizedCultoToken))
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
          descTokens = descTokens.filter((t: string) => t !== catTokenMatched)
        }
        if (cultoTokenMatched) {
          descTokens = descTokens.filter((t: string) => t !== cultoTokenMatched)
        }
        setDescricao(descTokens.join(' '))
      }
    }
  }, [normalizedCategorias, normalizedCultos, tipo])

  // 2. Parse Quick Entry instantly with debounce
  const handleQuickEntry = useMemo(() => {
    let timeout: NodeJS.Timeout
    return (text: string) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        parseQuickEntry(text)
      }, 120)
    }
  }, [parseQuickEntry])

  const handleQuickEntrySubmit = () => {
    if (!valorRaw || valorRaw <= 0) return

    const form = document.getElementById('transaction-form') as HTMLFormElement
    if (form) {
      form.requestSubmit()
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
      
      if (onSaveOptimistic) {
        onSaveOptimistic({ ...payload, id: transaction?.id })
      }

      let res;
      if (transaction) {
        res = await updateTransaction(transaction.id, payload)
      } else {
        res = await createTransaction(payload)
      }

      if (!res.success) throw new Error(res.error || 'Erro ao registrar lançamento')
      
      setSuccessMsg(transaction ? '✓ Lançamento atualizado com sucesso' : '✓ Lançamento salvo com sucesso')

      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1000)
    } catch (err: any) {
      if (onErrorRevert) {
        onErrorRevert()
      }
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

  return (
    <div style={modalOverlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      
      {/* Container Principal: Fundo Sólido Premium Substituindo Vidro */}
      <div className="bg-[#1a1f2b] border border-white/10 w-[90%] max-w-[500px] p-8 relative rounded-lg animate-[fadeIn_0.2s_ease-out] shadow-2xl">
        
        <h2 className="text-xl font-semibold mb-6 text-white">
          {transaction ? 'Editar lançamento' : 'Novo lançamento'}
        </h2>
        
        {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">{error}</div>}
        {successMsg && <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">{successMsg}</div>}

        <div className="flex flex-col gap-2 mb-6">
          <label className="text-sm font-medium text-[var(--text-color)]">Entrada rápida</label>
          <input 
            type="text" 
            className="input-field bg-black/20 focus:border-[#3b82f6] transition-all text-white" 
            placeholder="Ex: 50 oferta" 
            value={quickEntry}
            onChange={(e) => setQuickEntry(e.target.value)}
            onBlur={() => parseQuickEntry(quickEntry)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                parseQuickEntry(quickEntry)
                setTimeout(() => {
                  handleQuickEntrySubmit()
                }, 100)
              }
            }}
          />
        </div>

        <div className="flex gap-4 mb-6">
          <button 
            type="button"
            className={`flex-1 py-2 rounded-lg font-semibold transition-all duration-200 border ${tipo === 'ENTRADA' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/10 bg-transparent text-[var(--text-muted)] hover:bg-white/5'}`}
            onClick={() => setTipo('ENTRADA')}
          >
            Entrada
          </button>
          <button 
            type="button"
            className={`flex-1 py-2 rounded-lg font-semibold transition-all duration-200 border ${tipo === 'SAIDA' ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-white/10 bg-transparent text-[var(--text-muted)] hover:bg-white/5'}`}
            onClick={() => setTipo('SAIDA')}
          >
            Saída
          </button>
        </div>

        <form id="transaction-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Grid Coerente para Data e Valor (50/50) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 col-span-1">
              <label className="text-sm font-medium text-[var(--text-color)]">Data</label>
              <input type="date" name="data" required className="input-field h-[42px] px-3 bg-black/20 text-white" value={dataString} onChange={e => setDataString(e.target.value)} />
            </div>
            
            <div className="flex flex-col gap-2 col-span-1">
              <label className="text-sm font-medium text-[var(--text-color)]">Valor (R$)</label>
              <input 
                ref={valorInputRef}
                type="text" 
                value={valorDisplay}
                onChange={handleValorChange}
                required 
                className="input-field h-[42px] px-4 font-bold text-lg bg-black/20 focus:border-[#3b82f6] transition-all" 
                placeholder="R$ 0,00" 
                style={{
                  color: tipo === 'ENTRADA' ? '#34d399' : '#f87171',
                  borderColor: tipo === 'ENTRADA' ? 'rgba(52, 211, 153, 0.4)' : 'rgba(248, 113, 113, 0.4)'
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--text-color)]">Descrição</label>
            <input name="descricao" required className="input-field h-[42px] bg-black/20 text-white" placeholder="Ex: Oferta de Domingo, Conta de Luz..." value={descricao} onChange={e => setDescricao(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[var(--text-color)]">Categoria</label>
              <select name="categoria_id" className="input-field h-[42px] bg-black/20 text-white" value={categoriaId} onChange={e => setCategoriaId(e.target.value)}>
                <option value="">Nenhuma</option>
                {lookups.categorias
                  .filter(c => c.tipo === tipo || c.tipo === 'AMBOS')
                  .map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>

            {tipo === 'ENTRADA' && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--text-color)]">Culto (Opcional)</label>
                <select name="culto_id" className="input-field h-[42px] bg-black/20 text-white" value={cultoId} onChange={e => setCultoId(e.target.value)}>
                  <option value="">Nenhum</option>
                  {lookups.cultos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
            )}

            {tipo === 'ENTRADA' && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--text-color)]">Pagamento</label>
                <select name="payment_method" className="input-field h-[42px] bg-black/20 text-white">
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="PIX">PIX</option>
                  <option value="CARTAO">Cartão</option>
                  <option value="BOLETO">Boleto</option>
                  <option value="TRANSFERENCIA">Transferência</option>
                </select>
              </div>
            )}

            {tipo === 'SAIDA' && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--text-color)]">Responsável</label>
                <input type="text" name="responsavel" className="input-field h-[42px] bg-black/20 text-white" placeholder="Nome" />
              </div>
            )}
          </div>

          {tipo === 'SAIDA' && (
             <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--text-color)]">Comprovante</label>
                <input type="file" name="comprovante" id="comprovante" className="sr-only" accept="image/*,.pdf" />
                
                {/* Quadro de Anexo Centralizado Verticalmente */}
                <label htmlFor="comprovante" className="flex items-center justify-center h-[120px] rounded-lg border-2 border-dashed border-white/10 bg-black/20 cursor-pointer hover:border-[#3b82f6]/50 hover:bg-black/30 transition-all gap-4 px-6 text-center">
                    <UploadCloud className="h-10 w-10 text-[var(--text-muted)] flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-white">Clique ou arraste um arquivo para anexar...</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">Formatos suportados: Imagens, PDF (Máx. 5MB)</p>
                    </div>
                </label>
              </div>
          )}

          <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-white/10">
            <button 
              type="button" 
              className="px-6 py-2 rounded-lg font-medium text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-all" 
              onClick={onClose}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary !rounded-lg !px-10 !py-2" // AJUSTE DE LARGURA (px-10) E ALTURA (py-2) AQUI
              disabled={loading} 
              style={{ 
                backgroundColor: tipo === 'ENTRADA' ? '#10b981' : '#ef4444', 
                borderColor: tipo === 'ENTRADA' ? '#10b981' : '#ef4444',
                boxShadow: tipo === 'ENTRADA' ? '0 0 15px rgba(16, 185, 129, 0.4)' : '0 0 15px rgba(239, 68, 68, 0.4)'
              }}
            >
              {loading ? 'Salvando...' : (transaction ? 'Salvar alterações' : 'Salvar lançamento')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}