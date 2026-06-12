import React from 'react'

export default function IncomeByCulto({
  data
}: {
  data: { culto: string; total: number }[]
}) {
  return (
    <div className="card w-full mb-8 md:overflow-hidden">
      <div className="card-body border-b border-[var(--border-color)]">
        <h2 className="text-lg font-semibold mb-3">Entradas por Culto</h2>
      </div>
      <div className="md:overflow-x-auto md:overflow-visible" style={{ maxHeight: '420px', overflowY: 'auto' }}>
      <table className="table table-hover data-table block md:table w-full">
        <thead className="hidden md:table-header-group">
          <tr>
            <th>Culto</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody className="block md:table-row-group">
          {!data || data.length === 0 ? (
            <tr className="block md:table-row">
              <td colSpan={2} className="block md:table-cell">
                <div className="alert alert-soft alert-info m-4 text-center">
                  Sem dados para exibir neste período.
                </div>
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.culto} className="flex flex-col mb-4 border border-white/10 rounded-xl p-4 bg-white/[0.02] md:bg-transparent shadow-sm md:table-row md:mb-0 md:border-b md:border-white/5 md:p-0 md:shadow-none hover:bg-white/[0.04] md:hover:bg-white/5 transition-colors">
                <td className="flex justify-between items-center py-2 border-b border-white/5 last:border-b-0 md:table-cell md:border-none md:py-4 font-semibold text-white whitespace-normal break-words">
                  <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Culto</span>
                  <span className="text-right md:text-left">{item.culto}</span>
                </td>
                <td className="flex justify-between items-center py-2 border-b border-white/5 last:border-b-0 md:table-cell md:border-none md:py-4 md:text-right font-bold text-[var(--success)] whitespace-normal break-words">
                  <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Total</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total)}</span>
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
