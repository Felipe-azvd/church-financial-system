'use client'

import { createContext, useCallback, useContext, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, AlertTriangle, Info, X, type LucideIcon } from 'lucide-react'

type ToastTone = 'success' | 'error' | 'info'
type ToastItem = { id: number; message: string; tone: ToastTone }

const emptySubscribe = () => () => {}
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

const ToastContext = createContext<{ toast: (message: string, tone?: ToastTone) => void }>({
  toast: () => {},
})

export const useToast = () => useContext(ToastContext)

const TONE_STYLE: Record<ToastTone, { icon: LucideIcon; className: string }> = {
  success: { icon: CheckCircle2, className: 'border-[var(--color-success)] text-[var(--color-success)]' },
  error: { icon: AlertTriangle, className: 'border-[var(--color-error)] text-[var(--color-error)]' },
  info: { icon: Info, className: 'border-[var(--color-info)] text-[var(--color-info)]' },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const mounted = useMounted()

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = Date.now() + Math.random()
    setItems((prev) => [...prev, { id, message, tone }])
    setTimeout(() => dismiss(id), 4000)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {mounted &&
        createPortal(
          <div className="fixed bottom-4 right-4 z-[var(--z-toast)] flex flex-col gap-2 w-full max-w-sm px-4 sm:px-0">
            {items.map((item) => {
              const { icon: Icon, className } = TONE_STYLE[item.tone]
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-[var(--radius-field)] border bg-[var(--color-base-100)] shadow-[var(--shadow-md)] text-sm text-[var(--color-base-content)] ${className}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.message}</span>
                  <button
                    onClick={() => dismiss(item.id)}
                    className="text-[var(--text-muted)] hover:text-[var(--color-base-content)] flex-shrink-0"
                    aria-label="Fechar"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  )
}
