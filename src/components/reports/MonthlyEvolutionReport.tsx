'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { chartTooltipStyle } from '@/lib/chartColors'

export default function MonthlyEvolutionReport({
  data
}: {
  data: { month: string; total: number }[]
}) {
  const hasData = data && data.length > 0

  return (
    <div className="rounded-[var(--radius-box)] border border-[var(--color-base-300)] bg-[var(--color-base-100)] shadow-[var(--shadow-sm)] w-full mb-8">
      <div className="p-6 border-b border-[var(--color-base-300)]">
        <h2 className="text-lg font-semibold">Evolução Mensal</h2>
      </div>

      {!hasData ? (
        <div className="p-6">
          <div className="alert alert-soft alert-info">Sem dados para exibir neste período.</div>
        </div>
      ) : (
        <div className="p-6 pb-2 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEvolucao" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-base-300)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} width={70} />
              <Tooltip
                formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))}
                contentStyle={chartTooltipStyle}
                itemStyle={{ color: 'var(--color-base-content)', fontWeight: 500 }}
                labelStyle={{ color: 'var(--text-muted)', marginBottom: '4px' }}
              />
              <Area
                type="monotone"
                name="Entradas"
                dataKey="total"
                stroke="var(--color-success)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorEvolucao)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0, fill: 'var(--color-success)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
        <table className="table table-hover data-table">
          <thead>
            <tr>
              <th>Mês</th>
              <th style={{ textAlign: 'right' }}>Entradas</th>
            </tr>
          </thead>
          <tbody>
            {hasData && data.map((item, index) => (
              <tr key={`${item.month}-${index}`}>
                <td style={{ fontWeight: 500 }}>{item.month}</td>
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
