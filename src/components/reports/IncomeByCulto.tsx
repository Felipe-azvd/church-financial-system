import React from 'react'

export default function IncomeByCulto({
  data
}: {
  data: { culto: string; total: number }[]
}) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 'var(--spacing-xl)' }}>
      <h2 style={{ padding: 'var(--spacing-md)', margin: 0, borderBottom: '1px solid var(--border-color)', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
        Entradas por Culto
      </h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Culto</th>
            <th style={{ textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={2} style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-muted)' }}>
                Nenhuma entrada por culto registrada.
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.culto}>
                <td style={{ fontWeight: 500 }}>{item.culto}</td>
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
