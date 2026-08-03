"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react"
import { enviarEmailRecuperacao } from "@/app/actions/recuperacao"
import { Logo } from "@/components/ui/Logo"

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    await enviarEmailRecuperacao(email)
    setEnviado(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-page)] text-[var(--text-color)]">
      <div className="w-full max-w-md relative z-10">
        {/* Cabeçalho com marca */}
        <div className="text-center mb-10 flex flex-col items-center">
          <Logo className="w-14 h-14 text-[var(--primary-color)] mb-4" />
          <span className="font-serif font-semibold text-3xl tracking-tight">
            Church<span className="text-[var(--primary-color)]">Fep</span>
          </span>
          <p className="text-[var(--text-muted)] mt-2">Recuperação de Acesso</p>
        </div>

        {/* Formulário Principal */}
        <div className="rounded-lg border border-[var(--border-tint)] bg-[var(--surface-tint)] p-8 mb-6 shadow-md">
          {enviado ? (
            <div className="text-center space-y-4 animate-[fadeIn_0.3s_ease-out]">
              <div className="w-16 h-16 bg-[var(--primary-color)]/20 text-[var(--primary-color)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--primary-color)]/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-[var(--text-color)] font-semibold text-lg">E-mail enviado!</h2>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                Se existir uma conta associada a <strong className="text-[var(--text-color)]">{email}</strong>, você receberá um link de redefinição em instantes.
              </p>
              <Link href="/login" className="btn-primary w-full h-12 flex items-center justify-center text-base !rounded-lg mt-6">
                Voltar para o Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--text-color)]" htmlFor="email">E-mail cadastrado</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field w-full pl-10 text-sm"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary h-12 w-full flex items-center justify-center gap-2 text-base !rounded-lg mt-2 disabled:opacity-50">
                {loading ? 'Enviando...' : 'Receber link mágico'}
              </button>

              <div className="text-center mt-4">
                <Link href="/login" className="text-sm flex items-center justify-center gap-2 text-[var(--primary-color)] hover:brightness-125 transition-all">
                  <ArrowLeft size={16} /> Voltar
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}