'use client'

import { useState } from "react"
import NewChurchModal from "@/components/NewChurchModal"

export default function NewChurchButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-[var(--color-accent)]/10 hover:bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30 px-4 py-2 rounded-[var(--radius-field)] text-sm font-semibold transition-colors shrink-0"
      >
        + Nova Igreja
      </button>
      
      <NewChurchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}