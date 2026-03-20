import React from 'react'

export default function ExpensesByCategory({
  data
}: {
  data: { category: string; total: number }[]
}) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 'var(--spacing-xl)' }}>
      <div className="card-body" style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>
        <h2 className="card-title" style={{ fontSize: '1.125rem' }}>Saídas por Categoria</h2>
      </div>
      <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
      <table className="table table-hover data-table">
        <thead>
          <tr>
            <th>Categoria</th>
            <th style={{ textAlign: 'right' }}>Total</th>
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
              <tr key={item.category}>
                <td style={{ fontWeight: 500 }}>{item.category}</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--danger)' }}>
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
