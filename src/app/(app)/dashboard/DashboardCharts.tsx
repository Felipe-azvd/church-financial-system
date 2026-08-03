'use client'

import { useState, useEffect } from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { BarChart3 } from 'lucide-react'
import { colorForCategory, chartTooltipStyle } from '@/lib/chartColors'

const MONTH_NAMES: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
}

type ChartData = { name: string, value: number }
type EvolutionData = { date: string, entradas: number, saidas: number }

export default function DashboardCharts({
  evolutionData,
  pieEntradasData,
  pieSaidasData,
  barCultoData,
  insightsSlot
}: {
  evolutionData: EvolutionData[]
  pieEntradasData: ChartData[]
  pieSaidasData: ChartData[]
  barCultoData: ChartData[]
  insightsSlot?: React.ReactNode
}) {
  const [isMobile, setIsMobile] = useState(false)
  const [animateBars, setAnimateBars] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    const timer = setTimeout(() => setAnimateBars(true), 100)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timer)
    }
  }, [])

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`
  const tooltipStyle = chartTooltipStyle

  const monthlyMap: Record<string, { month: string; entradas: number; saidas: number }> = {}
  const today = new Date()
  for (let i = 4; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const mKey = String(d.getMonth() + 1).padStart(2, '0')
    monthlyMap[mKey] = { month: MONTH_NAMES[mKey], entradas: 0, saidas: 0 }
  }

  evolutionData.forEach((d) => {
    const parts = d.date.split('/')
    const monthKey = parts[1]
    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { month: MONTH_NAMES[monthKey] || monthKey, entradas: 0, saidas: 0 }
    }
    monthlyMap[monthKey].entradas += d.entradas
    monthlyMap[monthKey].saidas += d.saidas
  })

  const monthlyEvolutionData = Object.keys(monthlyMap).sort().map((k) => monthlyMap[k])

  const maxCultoValue = barCultoData.length > 0
    ? Math.max(...barCultoData.map(d => d.value))
    : 0

  const emptyState = (
    <div className="w-full h-[320px] flex flex-col items-center justify-center rounded-[var(--radius-box)] border border-dashed border-[var(--color-base-300)]">
      <BarChart3 className="w-10 h-10 text-[var(--text-muted)] mb-3" />
      <p className="text-sm font-medium text-[var(--text-muted)]">Nenhum dado neste período</p>
    </div>
  )

  const chartHeader = (title: string, subtitle: string) => (
    <div className="mb-6">
      <h3 className="text-base sm:text-lg font-semibold text-[var(--color-base-content)] tracking-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-[var(--text-muted)]">{subtitle}</p>
    </div>
  )

  const cardClass = "rounded-[var(--radius-box)] border border-[var(--color-base-300)] bg-[var(--color-base-100)] p-4 sm:p-6 shadow-[var(--shadow-sm)] w-full"
  const legendTextStyle = { color: 'var(--text-muted)', fontSize: '13px', marginLeft: '4px' }

  return (
    <div className="flex flex-col gap-6 mb-8 mt-6">

      {/* GRÁFICO 1: Evolução Financeira */}
      <div className={cardClass}>
        {chartHeader('Evolução Financeira', 'Volume financeiro ao longo do tempo')}

        {monthlyEvolutionData.length === 0 ? emptyState : (
          <div className="w-full min-w-0 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyEvolutionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-error)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-error)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-base-300)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} width={80} dx={-10} />
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value))}
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: 'var(--color-base-content)', fontWeight: 500, padding: '4px 0' }}
                  labelStyle={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '13px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" formatter={(value) => <span style={legendTextStyle}>{value}</span>} />
                <Area
                  type="monotone"
                  name="Entradas"
                  dataKey="entradas"
                  stroke="var(--color-success)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEntradas)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0, fill: 'var(--color-success)' }}
                />
                <Area
                  type="monotone"
                  name="Saídas"
                  dataKey="saidas"
                  stroke="var(--color-error)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSaidas)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0, fill: 'var(--color-error)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {insightsSlot}

      {/* GRÁFICOS PIE (Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-2">
        <div className={cardClass}>
          {chartHeader('Entradas por Categoria', 'Distribuição das receitas')}
          {pieEntradasData.length === 0 ? emptyState : (
            <div className="w-full min-w-0 h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieEntradasData} cx="50%" cy="45%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none">
                    {pieEntradasData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colorForCategory(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} contentStyle={tooltipStyle} itemStyle={{ color: 'var(--color-base-content)' }} labelStyle={{ display: 'none' }} />
                  <Legend layout={isMobile ? 'horizontal' : 'vertical'} verticalAlign={isMobile ? 'bottom' : 'middle'} align={isMobile ? 'center' : 'right'} formatter={(value) => <span style={legendTextStyle}>{value}</span>} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className={cardClass}>
          {chartHeader('Despesas por Categoria', 'Distribuição dos gastos')}
          {pieSaidasData.length === 0 ? emptyState : (
            <div className="w-full min-w-0 h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieSaidasData} cx="50%" cy="45%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none">
                    {pieSaidasData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colorForCategory(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} contentStyle={tooltipStyle} itemStyle={{ color: 'var(--color-base-content)' }} labelStyle={{ display: 'none' }} />
                  <Legend layout={isMobile ? 'horizontal' : 'vertical'} verticalAlign={isMobile ? 'bottom' : 'middle'} align={isMobile ? 'center' : 'right'} formatter={(value) => <span style={legendTextStyle}>{value}</span>} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* GRÁFICO BARRAS HORIZONTAIS */}
      <div className={cardClass}>
        {chartHeader('Entradas por Culto', 'Arrecadação detalhada por reunião')}

        {barCultoData.length === 0 ? emptyState : (
          <div className="w-full flex flex-col gap-6 mt-4 pb-4">
            {barCultoData.map((item, index) => {
              const color = colorForCategory(item.name)
              const percentage = maxCultoValue > 0 ? (item.value / maxCultoValue) * 100 : 0

              return (
                <div key={index} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }}></div>
                      <span className="text-sm font-medium text-[var(--color-base-content)]">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold tabular-nums text-[var(--color-base-content)] tracking-tight">{formatCurrency(item.value)}</span>
                  </div>

                  <div className="h-2 w-full bg-[var(--color-base-200)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: animateBars ? `${percentage}%` : '0%', backgroundColor: color }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
