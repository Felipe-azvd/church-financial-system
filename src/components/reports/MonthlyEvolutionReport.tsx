import React from 'react'

export default function MonthlyEvolutionReport({
  data
}: {
  data: { month: string; total: number }[]
}) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 'var(--spacing-xl)' }}>
      <div className="card-body" style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>
        <h2 className="card-title" style={{ fontSize: '1.125rem' }}>Evolução Financeira Mensal</h2>
      </div>
      <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
      <table className="table table-hover data-table">
        <thead>
          <tr>
            <th>Mês</th>
            <th style={{ textAlign: 'right' }}>Entradas</th>
          </tr>
        </thead>
        <tbody>
          {!data || data.length === 0 ? (
            <tr>
              <td colSpan={2}>
                <div className="alert alert-soft alert-info" style={{ margin: 'var(--spacing-md)' }}>
                  Sem dados para exibir neste período.
                </div>
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
    </div>
  )
}
