'use client'

import { useState } from "react"
import NewChurchModal from "@/components/NewChurchModal"

export default function NewChurchButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shrink-0"
      >
        + Nova Igreja
      </button>
      
      <NewChurchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}