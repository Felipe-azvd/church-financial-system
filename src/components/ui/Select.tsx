'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { computePosition, flip, shift, offset, size, autoUpdate } from '@floating-ui/dom'
import { ChevronDown, Check } from 'lucide-react'

export type SelectOption<T extends string = string> = {
  value: T
  label: string
  disabled?: boolean
}

type SelectProps<T extends string = string> = {
  value: T | ''
  onChange: (value: T) => void
  options: SelectOption<T>[]
  placeholder?: string
  disabled?: boolean
  name?: string
  'aria-label'?: string
}

export function Select<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  disabled,
  name,
  'aria-label': ariaLabel,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  const selected = options.find((o) => o.value === value)
  const enabledIndexes = options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i !== -1)

  useEffect(() => {
    if (!open || !buttonRef.current || !menuRef.current) return
    return autoUpdate(buttonRef.current, menuRef.current, () => {
      if (!buttonRef.current || !menuRef.current) return
      computePosition(buttonRef.current, menuRef.current, {
        placement: 'bottom-start',
        strategy: 'fixed',
        middleware: [
          offset(4),
          flip(),
          shift({ padding: 8 }),
          size({
            padding: 8,
            apply({ availableHeight, rects, elements }) {
              Object.assign(elements.floating.style, {
                maxHeight: `${Math.min(availableHeight, 320)}px`,
                minWidth: `${rects.reference.width}px`,
              })
            },
          }),
        ],
      }).then(({ x, y }) => {
        if (!menuRef.current) return
        Object.assign(menuRef.current.style, { left: `${x}px`, top: `${y}px` })
      })
    })
  }, [open])

  useEffect(() => {
    if (!open) return
    const onClickOutside = (e: MouseEvent) => {
      if (buttonRef.current?.contains(e.target as Node) || menuRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  const selectOption = (index: number) => {
    const option = options[index]
    if (!option || option.disabled) return
    onChange(option.value)
    setOpen(false)
    buttonRef.current?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      setOpen(true)
      setActiveIndex(enabledIndexes[0] ?? -1)
      return
    }
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const pos = enabledIndexes.indexOf(activeIndex)
      setActiveIndex(enabledIndexes[Math.min(pos + 1, enabledIndexes.length - 1)] ?? enabledIndexes[0])
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const pos = enabledIndexes.indexOf(activeIndex)
      setActiveIndex(enabledIndexes[Math.max(pos - 1, 0)] ?? enabledIndexes[0])
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      selectOption(activeIndex)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      buttonRef.current?.focus()
    }
  }

  return (
    <div className="relative inline-block w-full">
      {name && <input type="hidden" name={name} value={value} />}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className="input-field w-full flex items-center justify-between gap-2 text-left disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={`truncate ${selected ? '' : 'text-[var(--text-muted)]'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="listbox"
          id={listboxId}
          className="fixed z-[var(--z-dropdown)] overflow-y-auto rounded-[var(--radius-field)] border border-[var(--color-base-300)] bg-[var(--color-base-100)] shadow-[var(--shadow-md)] py-1"
        >
          {options.map((option, i) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              disabled={option.disabled}
              onClick={() => selectOption(i)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left disabled:opacity-40 disabled:cursor-not-allowed ${
                i === activeIndex ? 'bg-[var(--color-base-200)]' : ''
              } ${option.value === value ? 'text-[var(--color-primary)] font-medium' : 'text-[var(--color-base-content)]'}`}
            >
              <span className="truncate">{option.label}</span>
              {option.value === value && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
