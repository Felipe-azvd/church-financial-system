import React from 'react'

export default function CategoryReport({
  data
}: {
  data: { category: string; total: number }[]
}) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 'var(--spacing-xl)' }}>
      <h2 style={{ padding: 'var(--spacing-md)', margin: 0, borderBottom: '1px solid var(--border-color)', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
        Transações por Categoria
      </h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Categoria</th>
            <th style={{ textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={2} style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-muted)' }}>
                Nenhuma transação com categoria encontrada.
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.category}>
                <td style={{ fontWeight: 500 }}>{item.category}</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
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
