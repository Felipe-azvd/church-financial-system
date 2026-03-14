import React from 'react'

export default function FinancialSummary({
  ano,
  entradas,
  saidas,
  saldo,
  melhorMes,
  maiorDespesa,
  mediaMensal
}: {
  ano: number
  entradas: number
  saidas: number
  saldo: number
  melhorMes: string
  maiorDespesa: string
  mediaMensal: number
}) {
  return (
    <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
      <h2 style={{ 
        marginBottom: 'var(--spacing-md)', 
        fontSize: '1.25rem', 
        color: 'var(--text-primary)' 
      }}>
        Resumo Financeiro {ano}
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--spacing-md)'
      }}>
        <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
          <h3 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Entradas totais</h3>
          <p style={{ margin: 'var(--spacing-sm) 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(entradas)}
          </p>
        </div>
        
        <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
          <h3 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saídas totais</h3>
          <p style={{ margin: 'var(--spacing-sm) 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saidas)}
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
          <h3 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saldo anual</h3>
          <p style={{ margin: 'var(--spacing-sm) 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: saldo >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldo)}
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
          <h3 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Melhor mês</h3>
          <p style={{ margin: 'var(--spacing-sm) 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {melhorMes}
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
          <h3 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Maior despesa</h3>
          <p style={{ margin: 'var(--spacing-sm) 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {maiorDespesa}
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
          <h3 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Média mensal</h3>
          <p style={{ margin: 'var(--spacing-sm) 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mediaMensal)}
          </p>
        </div>
      </div>
    </div>
  )
}
