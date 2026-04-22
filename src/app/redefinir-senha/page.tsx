"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, ArrowRight, ShieldAlert } from "lucide-react"
import { salvarNovaSenha } from "@/app/actions/recuperacao"

function RedefinirSenhaForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [senha, setSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) return setErro("Link de recuperação inválido.")
    if (senha !== confirmarSenha) return setErro("As senhas não coincidem.")
    if (senha.length < 6) return setErro("A senha deve ter pelo menos 6 caracteres.")

    setLoading(true)
    setErro("")

    const res = await salvarNovaSenha(token, senha)
    
    if (res.success) {
      alert("Senha alterada com sucesso! Você já pode fazer login.")
      router.push("/login")
    } else {
      setErro(res.error || "Ocorreu um erro.")
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-white font-semibold text-lg">Link Inválido</h2>
        <p className="text-[var(--text-muted)] text-sm">O link de redefinição está ausente, mal formatado ou já expirou.</p>
        <Link href="/esqueci-senha" className="btn-primary w-full h-12 flex items-center justify-center text-base !rounded-lg mt-4">
          Solicitar novo link
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {erro && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center">
          {erro}
        </div>
      )}
      
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[var(--text-color)]">Nova Senha</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]" />
          <input
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="input-field w-full pl-10 py-3 rounded-lg text-sm bg-black/20 focus:border-[var(--primary-color)] transition-all"
            placeholder="Mínimo de 6 caracteres"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[var(--text-color)]">Confirmar Nova Senha</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]" />
          <input
            type="password"
            required
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            className="input-field w-full pl-10 py-3 rounded-lg text-sm bg-black/20 focus:border-[var(--primary-color)] transition-all"
            placeholder="Repita a senha"
          />
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary h-12 w-full flex items-center justify-center gap-2 text-base !rounded-lg mt-2 disabled:opacity-50">
        {loading ? 'Salvando...' : <>Salvar nova senha <ArrowRight size={18} /></>}
      </button>
    </form>
  )
}

export default function RedefinirSenhaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--bg-page)] text-[var(--text-color)] transition-colors duration-500">
      {/* Luzes de fundo sincronizadas com o tema (Copiado do LoginForm) */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[var(--primary-color)] opacity-[0.07] rounded-full blur-[100px] -translate-x-1/3 -translate-y-1/3 pointer-events-none transition-colors duration-500"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[var(--primary-color)] opacity-[0.05] rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none transition-colors duration-500"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Cabeçalho com Logo PNG (Copiado do LoginForm) */}
        <div className="text-center mb-10 flex flex-col items-center">
          <img src="/logo-c.png" alt="ChurchFin Logo" className="w-[280px] h-auto object-contain drop-shadow-[0_0_15px_var(--primary-glow)] transition-all duration-500 mb-3" />
          <p className="text-[var(--text-muted)] mt-2">Segurança em primeiro lugar.</p>
        </div>

        {/* Formulário Principal - Fundo Sincronizado (Copiado do LoginForm) */}
        <div className="rounded-2xl border border-[var(--border-tint)] bg-[var(--surface-tint)] p-8 mb-6 shadow-2xl backdrop-blur-md transition-colors duration-500">
          <h2 className="text-xl font-semibold text-[var(--text-color)] mb-6 text-center">Criar Nova Senha</h2>
          <Suspense fallback={<div className="text-center text-[var(--text-muted)]">Carregando formulário...</div>}>
            <RedefinirSenhaForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}