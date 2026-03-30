'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const res = await signIn('credentials', {
      redirect: false,
      email,
      senha,
    })

    if (res?.error) {
      setError('Credenciais inválidas. Tente novamente.')
      setIsLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="login-container">
      <div className="card login-card">
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
          <h1 className="text-2xl font-semibold mb-3">Church Financial</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Acesse sua conta</p>
        </div>

        {error && (
          <div style={{ 
            padding: 'var(--spacing-md)', 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            color: 'var(--danger)', 
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-md)',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
            />
          </div>

          <div className="input-group" style={{ marginBottom: 'var(--spacing-xl)' }}>
            <label className="input-label" htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              className="input-field"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-tertiary);
          padding: var(--spacing-md);
        }
        .login-card {
          width: 100%;
          max-width: 400px;
          border-top: 4px solid var(--accent-primary);
        }
      `}</style>
    </div>
  )
}
