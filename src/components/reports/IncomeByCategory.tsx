'use client'

import { BarChart, Bar, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { colorForCategory, chartTooltipStyle } from '@/lib/chartColors'

export default function IncomeByCategory({
  data
}: {
  data: { category: string; total: number }[]
}) {
  const hasData = data && data.length > 0
  const chartData = hasData ? [...data].sort((a, b) => a.total - b.total) : []

  return (
    <div className="rounded-[var(--radius-box)] border border-[var(--color-base-300)] bg-[var(--color-base-100)] shadow-[var(--shadow-sm)] w-full mb-8">
      <div className="p-6 border-b border-[var(--color-base-300)]">
        <h2 className="text-lg font-semibold">Entradas por Categoria</h2>
      </div>

      {!hasData ? (
        <div className="p-6">
          <div className="alert alert-soft alert-info">Sem dados para exibir neste período.</div>
        </div>
      ) : (
        <div className="p-6 pb-2">
          <div style={{ height: Math.max(chartData.length * 40, 120) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="category" width={140} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'var(--color-base-200)' }}
                  formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))}
                  contentStyle={chartTooltipStyle}
                  labelStyle={{ color: 'var(--color-base-content)', fontWeight: 600 }}
                />
                <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={16}>
                  {chartData.map((entry, index) => (
                    <Cell key={`${entry.category}-${index}`} fill={colorForCategory(entry.category)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
        <table className="table table-hover data-table">
          <thead>
            <tr>
              <th>Categoria</th>
              <th style={{ textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {hasData && data.map((item, index) => (
              <tr key={`${item.category}-${index}`}>
                <td style={{ fontWeight: 500 }}>{item.category}</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--color-success)' }} className="tabular-nums">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
