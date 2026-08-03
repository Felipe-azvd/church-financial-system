'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { createTransaction, updateTransaction } from '@/app/actions/finance'
import { UploadCloud } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'

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
  const [categoriaId, setCategoriaId] = useState('none')
  const [cultoId, setCultoId] = useState('none')
  const [paymentMethod, setPaymentMethod] = useState('DINHEIRO')
  const [dataString, setDataString] = useState(new Date().toISOString().split('T')[0])
  const [valorRaw, setValorRaw] = useState<number>(0)
  const [valorDisplay, setValorDisplay] = useState<string>('')
  const valorInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        setTipo(transaction.tipo as 'ENTRADA' | 'SAIDA')
        setValorRaw(transaction.valor)
        setValorDisplay(formatCurrency(transaction.valor))
        setDescricao(transaction.descricao)
        setCategoriaId(transaction.categoria_id || 'none')
        setCultoId(transaction.culto_id || 'none')
        setDataString(transaction.data)
      } else {
        setTipo('ENTRADA')
        setValorRaw(0)
        setValorDisplay('')
        setDescricao('')
        setCategoriaId('none')
        setCultoId('none')
        setPaymentMethod('DINHEIRO')
        setQuickEntry('')
        setDataString(new Date().toISOString().split('T')[0])
      }
      setSuccessMsg('')
      setError('')
    }
  }, [isOpen, transaction])

  const normalize = (text: string) => {
    return text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
  }

  const normalizedCategorias = useMemo(() => {
    return lookups.categorias.map((c) => ({ ...c, normalized: normalize(c.nome) }))
  }, [lookups.categorias])

  const normalizedCultos = useMemo(() => {
    return lookups.cultos.map((c) => ({ ...c, normalized: normalize(c.nome) }))
  }, [lookups.cultos])

  const parseQuickEntry = useCallback((text: string) => {
    if (!text.trim()) return
    const tokens = text.trim().split(/\s+/)
    if (tokens.length === 0) return

    const numericTokenIndex = tokens.findIndex((t: string) => /^\d+(?:[.,]\d+)?$/.test(t))

    if (numericTokenIndex !== -1) {
      const rawVal = tokens[numericTokenIndex].replace(',', '.')
      const numericValue = parseFloat(rawVal)
      if (!isNaN(numericValue) && numericValue > 0) {
        setValorRaw(numericValue)
        setValorDisplay(formatCurrency(numericValue))
      }

      const remainingTokens = tokens.filter((_, idx) => idx !== numericTokenIndex)

      if (remainingTokens.length > 0) {
        let matchedCatId = 'none'
        let catTokenMatched = ''

        const catToken = remainingTokens[0]
        if (catToken) {
          const normalizedToken = normalize(catToken)
          const validCats = normalizedCategorias.filter((c) => c.tipo === tipo || c.tipo === 'AMBOS')
          let partialCat = validCats.find((c) => c.normalized.startsWith(normalizedToken))
          if (!partialCat) partialCat = validCats.find((c) => c.normalized.includes(normalizedToken))

          if (partialCat) {
            matchedCatId = partialCat.id
            catTokenMatched = catToken
          }
        }
        setCategoriaId(matchedCatId)

        let matchedCultoId = 'none'
        let cultoTokenMatched = ''

        const potentialCultoTokens = remainingTokens.slice(1)
        for (const token of potentialCultoTokens) {
          const normalizedCultoToken = normalize(token)
          let partialCulto = normalizedCultos.find((c) => c.normalized.startsWith(normalizedCultoToken))
          if (!partialCulto) partialCulto = normalizedCultos.find((c) => c.normalized.includes(normalizedCultoToken))

          if (partialCulto) {
            matchedCultoId = partialCulto.id
            cultoTokenMatched = token
            break
          }
        }
        setCultoId(matchedCultoId)

        let descTokens = [...remainingTokens]
        if (catTokenMatched) descTokens = descTokens.filter((t) => t !== catTokenMatched)
        if (cultoTokenMatched) descTokens = descTokens.filter((t) => t !== cultoTokenMatched)
        setDescricao(descTokens.join(' '))
      }
    }
  }, [normalizedCategorias, normalizedCultos, tipo])

  const handleQuickEntrySubmit = () => {
    if (!valorRaw || valorRaw <= 0) return
    const form = document.getElementById('transaction-form') as HTMLFormElement
    if (form) form.requestSubmit()
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

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

  useEffect(() => {
    if (isOpen && valorInputRef.current) {
      setTimeout(() => valorInputRef.current?.focus(), 50)
    }
  }, [isOpen, tipo])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (valorRaw <= 0) { setError('O valor deve ser maior que zero'); return }
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)

    const rawCat = formData.get('categoria_id') as string
    const rawCulto = formData.get('culto_id') as string

    const finalCategoriaId = (!rawCat || rawCat === 'none') ? null : rawCat
    const finalCultoId = (!rawCulto || rawCulto === 'none') ? null : rawCulto

    try {
      const payload = {
        descricao: formData.get('descricao') as string,
        valor: valorRaw,
        data: formData.get('data') as string,
        tipo: tipo,
        categoria_id: finalCategoriaId,
        culto_id: (tipo === 'ENTRADA') ? finalCultoId : null,
      }

      if (onSaveOptimistic) onSaveOptimistic({ ...payload, id: transaction?.id })

      let res
      if (transaction) res = await updateTransaction(transaction.id, payload)
      else res = await createTransaction(payload)

      if (!res.success) throw new Error(res.error || 'Erro ao registrar lançamento')
      setSuccessMsg(transaction ? 'Lançamento atualizado com sucesso' : 'Lançamento salvo com sucesso')

      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1000)
    } catch (err: any) {
      if (onErrorRevert) onErrorRevert()
      setError(err.message || 'Erro ao registrar lançamentos')
    } finally {
      setLoading(false)
    }
  }

  const toneClass = tipo === 'ENTRADA'
    ? { text: 'text-[var(--color-success)]', border: 'border-[var(--color-success)]', bg: 'bg-[var(--color-success)]/10' }
    : { text: 'text-[var(--color-error)]', border: 'border-[var(--color-error)]', bg: 'bg-[var(--color-error)]/10' }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={transaction ? 'Editar lançamento' : 'Novo lançamento'} size="md">
      {error && <div className="mb-4 p-3 rounded-[var(--radius-field)] bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)] text-sm font-medium">{error}</div>}
      {successMsg && <div className="mb-4 p-3 rounded-[var(--radius-field)] bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 text-[var(--color-success)] text-sm font-semibold">{successMsg}</div>}

      <div className="flex flex-col gap-2 mb-6">
        <label className="text-sm font-medium">Entrada rápida</label>
        <input
          type="text"
          className="input-field"
          placeholder="Ex: 50 oferta"
          value={quickEntry}
          onChange={(e) => setQuickEntry(e.target.value)}
          onBlur={() => parseQuickEntry(quickEntry)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              parseQuickEntry(quickEntry)
              setTimeout(() => handleQuickEntrySubmit(), 100)
            }
          }}
        />
      </div>

      <div className="flex gap-4 mb-6">
        <button
          type="button"
          className={`flex-1 py-2 rounded-[var(--radius-field)] font-semibold transition-colors border ${tipo === 'ENTRADA' ? `${toneClass.border} ${toneClass.bg} ${toneClass.text}` : 'border-[var(--color-base-300)] bg-transparent text-[var(--text-muted)] hover:bg-[var(--color-base-200)]'}`}
          onClick={() => setTipo('ENTRADA')}
        >
          Entrada
        </button>
        <button
          type="button"
          className={`flex-1 py-2 rounded-[var(--radius-field)] font-semibold transition-colors border ${tipo === 'SAIDA' ? 'border-[var(--color-error)] bg-[var(--color-error)]/10 text-[var(--color-error)]' : 'border-[var(--color-base-300)] bg-transparent text-[var(--text-muted)] hover:bg-[var(--color-base-200)]'}`}
          onClick={() => setTipo('SAIDA')}
        >
          Saída
        </button>
      </div>

      <form id="transaction-form" onSubmit={handleSubmit} className="flex flex-col gap-5">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 col-span-1">
            <label className="text-sm font-medium">Data</label>
            <input
              type="date"
              name="data"
              required
              className="input-field"
              value={dataString}
              onChange={e => setDataString(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2 col-span-1">
            <label className="text-sm font-medium">Valor (R$)</label>
            <input
              ref={valorInputRef}
              type="text"
              value={valorDisplay}
              onChange={handleValorChange}
              required
              className={`input-field font-bold text-lg ${toneClass.text} ${toneClass.border}`}
              placeholder="R$ 0,00"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Descrição</label>
          <input name="descricao" required className="input-field" placeholder="Ex: Oferta de Domingo, Conta de Luz..." value={descricao} onChange={e => setDescricao(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Categoria</label>
            <Select
              value={categoriaId}
              onChange={setCategoriaId}
              name="categoria_id"
              options={[
                { value: 'none', label: 'Nenhuma' },
                ...lookups.categorias
                  .filter(c => c.tipo === tipo || c.tipo === 'AMBOS')
                  .map(c => ({ value: c.id, label: c.nome }))
              ]}
            />
          </div>

          {tipo === 'ENTRADA' && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Culto (Opcional)</label>
              <Select
                value={cultoId}
                onChange={setCultoId}
                name="culto_id"
                options={[
                  { value: 'none', label: 'Nenhum' },
                  ...lookups.cultos.map(c => ({ value: c.id, label: c.nome }))
                ]}
              />
            </div>
          )}

          {tipo === 'ENTRADA' && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Pagamento</label>
              <Select
                value={paymentMethod}
                onChange={setPaymentMethod}
                name="payment_method"
                options={[
                  { value: 'DINHEIRO', label: 'Dinheiro' },
                  { value: 'PIX', label: 'PIX' },
                  { value: 'CARTAO', label: 'Cartão' },
                  { value: 'BOLETO', label: 'Boleto' },
                  { value: 'TRANSFERENCIA', label: 'Transferência' }
                ]}
              />
            </div>
          )}

          {tipo === 'SAIDA' && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Responsável</label>
              <input type="text" name="responsavel" className="input-field" placeholder="Nome" />
            </div>
          )}
        </div>

        {tipo === 'SAIDA' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Comprovante</label>
            <input type="file" name="comprovante" id="comprovante" className="sr-only" accept="image/*,.pdf" />

            <label htmlFor="comprovante" className="flex items-center justify-center h-[120px] rounded-[var(--radius-field)] border-2 border-dashed border-[var(--color-base-300)] cursor-pointer hover:border-[var(--color-primary)] hover:bg-[var(--color-base-200)] transition-colors gap-4 px-6 text-center">
              <UploadCloud className="h-10 w-10 text-[var(--text-muted)] flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Clique ou arraste um arquivo para anexar...</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Formatos suportados: Imagens, PDF (Máx. 5MB)</p>
              </div>
            </label>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-[var(--color-base-300)]">
          <button
            type="button"
            className="px-6 py-2 rounded-[var(--radius-field)] font-medium text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--color-base-200)] transition-colors"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`px-10 py-2 rounded-[var(--radius-field)] font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 ${tipo === 'ENTRADA' ? 'bg-[var(--color-success)] text-[var(--color-success-content)]' : 'bg-[var(--color-error)] text-[var(--color-error-content)]'}`}
            disabled={loading}
          >
            {loading ? 'Salvando...' : (transaction ? 'Salvar alterações' : 'Salvar lançamento')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
