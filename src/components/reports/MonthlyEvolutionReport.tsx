import React from 'react'

export default function MonthlyEvolutionReport({
  data
}: {
  data: { month: string; total: number }[]
}) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 'var(--spacing-xl)' }}>
      <h2 style={{ padding: 'var(--spacing-md)', margin: 0, borderBottom: '1px solid var(--border-color)', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
        Evolução Financeira Mensal
      </h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Mês</th>
            <th style={{ textAlign: 'right' }}>Entradas</th>
          </tr>
        </thead>
        <tbody>
          {!data || data.length === 0 ? (
            <tr>
              <td colSpan={2} style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-muted)' }}>
                Nenhuma entrada registrada.
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.month}>
                <td style={{ fontWeight: 500 }}>{item.month}</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--success)' }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
