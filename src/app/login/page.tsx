'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Mail, Lock, ArrowRight, Info } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    })

    if (res?.error) {
      setError(res.error === 'CredentialsSignin' ? 'Credenciais inválidas. Tente novamente.' : res.error)
      setIsLoading(false)
    } else {
      if (email === 'felipeabreu.1994@gmail.com') {
        router.push('/super-admin')
      } else {
        router.push('/dashboard')
      }
    }
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
          <p className="text-[var(--text-muted)] mt-2">Inovação com propósito.</p>
        </div>

        {/* Formulário Principal */}
        <div className="rounded-lg border border-[var(--border-tint)] bg-[var(--surface-tint)] p-8 mb-6 shadow-md">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[var(--text-color)]" htmlFor="email">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]" />
                <input
                  id="email"
                  type="email"
                  className="input-field w-full pl-10 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[var(--text-color)]" htmlFor="password">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]" />
                <input
                  id="password"
                  type="password"
                  className="input-field w-full pl-10 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex justify-end mt-1 mb-2">
              <Link href="/esqueci-senha" className="text-sm text-[var(--primary-color)] hover:brightness-125 transition-all">
                Esqueci minha senha
              </Link>
            </div>

            <button 
              type="submit" 
              className="btn-primary h-12 w-full flex items-center justify-center gap-2 text-base !rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                'Entrando...'
              ) : (
                <>Entrar <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </div>

        {/* Bloco de Informação - Sincronizado */}
        <div className="p-4 bg-[var(--surface-tint)] flex gap-3 items-start border border-[var(--border-tint)] rounded-lg">
          <Info className="h-5 w-5 text-[var(--primary-color)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[var(--text-color)]">Precisa de uma conta?</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
              O cadastro é realizado apenas por convite. Entre em contato com a liderança da sua igreja para solicitar acesso.
            </p>
          </div>
        </div>

        {/* Rodapé */}
        <p className="text-center text-[var(--text-muted)] text-xs mt-8">
          Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.
        </p>
      </div>
    </div>
  )
}