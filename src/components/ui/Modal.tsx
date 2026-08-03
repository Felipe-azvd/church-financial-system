'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const emptySubscribe = () => () => {}
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

const SIZE_CLASS = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
} as const

export type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  size?: keyof typeof SIZE_CLASS
  children: React.ReactNode
  footer?: React.ReactNode
  closeOnBackdropClick?: boolean
  closeOnEsc?: boolean
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  closeOnBackdropClick = true,
  closeOnEsc = true,
}: ModalProps) {
  const mounted = useMounted()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen || !closeOnEsc) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, closeOnEsc, onClose])

  useEffect(() => {
    if (isOpen) dialogRef.current?.focus()
  }, [isOpen])

  if (!mounted || !isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[var(--z-overlay)] flex items-center justify-center bg-black/40 p-4 animate-[fadeIn_0.15s_ease-out]"
      onClick={closeOnBackdropClick ? onClose : undefined}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${SIZE_CLASS[size]} rounded-[var(--radius-box)] border border-[var(--color-base-300)] bg-[var(--color-base-100)] text-[var(--color-base-content)] shadow-[var(--shadow-lg)] relative z-[var(--z-modal)] outline-none`}
      >
        <div className="flex items-start justify-between gap-4 p-6 border-b border-[var(--color-base-300)]">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold">{title}</h2>
            {description && <p className="text-sm text-[var(--text-muted)] mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--color-base-content)] hover:bg-[var(--color-base-200)] transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--color-base-300)]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
