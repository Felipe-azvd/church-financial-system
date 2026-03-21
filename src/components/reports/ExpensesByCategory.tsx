import React from 'react'

export default function ExpensesByCategory({
  data
}: {
  data: { category: string; total: number }[]
}) {
  return (
    <div className="card w-full mb-8 overflow-hidden">
      <div className="card-body border-b border-[var(--border-color)]">
        <h2 className="text-lg font-semibold mb-3">Despesas por Categoria</h2>
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
                <div className="alert alert-soft alert-info m-4">
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
