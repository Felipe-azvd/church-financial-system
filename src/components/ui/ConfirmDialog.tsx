'use client'

import { useCallback, useState } from 'react'
import { Modal } from './Modal'

type ConfirmOptions = {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'default' | 'danger'
}

type ConfirmDialogProps = ConfirmOptions & {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'default',
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onOpenChange(false)}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-[var(--radius-field)] text-sm font-medium border border-[var(--color-base-300)] text-[var(--color-base-content)] hover:bg-[var(--color-base-200)] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-[var(--radius-field)] text-sm font-medium transition-colors ${
              tone === 'danger'
                ? 'bg-[var(--color-error)] text-[var(--color-error-content)] hover:opacity-90'
                : 'bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:opacity-90'
            }`}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      {null}
    </Modal>
  )
}

export function useConfirm() {
  const [state, setState] = useState<null | (ConfirmOptions & { resolve: (v: boolean) => void })>(null)

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, resolve })
    })
  }, [])

  const handleClose = (result: boolean) => {
    state?.resolve(result)
    setState(null)
  }

  const ConfirmDialogElement = state ? (
    <ConfirmDialog
      isOpen
      onOpenChange={(open) => { if (!open) handleClose(false) }}
      title={state.title}
      description={state.description}
      confirmLabel={state.confirmLabel}
      cancelLabel={state.cancelLabel}
      tone={state.tone}
      onConfirm={() => handleClose(true)}
    />
  ) : null

  return { confirm, ConfirmDialogElement }
}
