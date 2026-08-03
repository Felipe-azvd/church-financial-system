'use client'

import { BarChart, Bar, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { colorForCategory, chartTooltipStyle } from '@/lib/chartColors'

export default function IncomeByCulto({
  data
}: {
  data: { culto: string; total: number }[]
}) {
  const hasData = data && data.length > 0
  const chartData = hasData ? [...data].sort((a, b) => a.total - b.total) : []

  return (
    <div className="rounded-[var(--radius-box)] border border-[var(--color-base-300)] bg-[var(--color-base-100)] shadow-[var(--shadow-sm)] w-full mb-8">
      <div className="p-6 border-b border-[var(--color-base-300)]">
        <h2 className="text-lg font-semibold">Entradas por Culto</h2>
      </div>

      {!hasData ? (
        <div className="p-6">
          <div className="alert alert-soft alert-info text-center">Sem dados para exibir neste período.</div>
        </div>
      ) : (
        <div className="p-6 pb-2">
          <div style={{ height: Math.max(chartData.length * 40, 120) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="culto" width={140} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'var(--color-base-200)' }}
                  formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))}
                  contentStyle={chartTooltipStyle}
                  labelStyle={{ color: 'var(--color-base-content)', fontWeight: 600 }}
                />
                <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={16}>
                  {chartData.map((entry, index) => (
                    <Cell key={`${entry.culto}-${index}`} fill={colorForCategory(entry.culto)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="md:overflow-x-auto md:overflow-visible" style={{ maxHeight: '360px', overflowY: 'auto' }}>
        <table className="table table-hover data-table block md:table w-full">
          <thead className="hidden md:table-header-group">
            <tr>
              <th>Culto</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody className="block md:table-row-group">
            {hasData && data.map((item, index) => (
              <tr key={`${item.culto}-${index}`} className="flex flex-col bg-transparent py-4 border-b border-[var(--color-base-300)] last:border-b-0 md:table-row md:py-0 md:hover:bg-[var(--color-base-200)] transition-colors">
                <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4 font-semibold whitespace-normal break-words">
                  <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Culto</span>
                  <span className="text-right md:text-left">{item.culto}</span>
                </td>
                <td className="flex justify-between items-center py-2 border-b border-[var(--color-base-300)] last:border-b-0 md:table-cell md:border-none md:py-4 md:text-right font-bold text-[var(--color-success)] tabular-nums whitespace-normal break-words">
                  <span className="md:hidden font-semibold text-[var(--text-muted)] text-xs">Total</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
