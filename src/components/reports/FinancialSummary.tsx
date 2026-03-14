import React from 'react'

export default function FinancialSummary({
  entradas,
  saidas,
  saldo
}: {
  entradas: number
  saidas: number
  saldo: number
}) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Math.abs(val)) // Abs used so that `-` is not attached from the raw value, but we can prepend it if desired. Though Intl can handle negative natively. Let's just pass `val` to let Intl handle it properly.
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: 'var(--spacing-md)',
      marginBottom: 'var(--spacing-xl)'
    }}>
      <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)' }}>Entradas</h3>
        <p style={{ margin: 'var(--spacing-sm) 0 0 0', fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)' }}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(entradas)}
        </p>
      </div>
      
      <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)' }}>Saídas</h3>
        <p style={{ margin: 'var(--spacing-sm) 0 0 0', fontSize: '1.75rem', fontWeight: 700, color: 'var(--danger)' }}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saidas)}
        </p>
      </div>

      <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)' }}>Saldo</h3>
        <p style={{ margin: 'var(--spacing-sm) 0 0 0', fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldo)}
        </p>
      </div>
    </div>
  )
}
