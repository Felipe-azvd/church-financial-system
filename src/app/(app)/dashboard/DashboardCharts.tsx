'use client'

import { useState, useEffect } from 'react'
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  BarChart, Bar 
} from 'recharts'

const COLORS_ENTRADA = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0']
const COLORS_SAIDA = ['#ef4444', '#dc2626', '#f87171', '#fca5a5', '#fecaca']
const COLORS_CULTO = ['#3b82f6', '#2563eb', '#60a5fa', '#93c5fd', '#bfdbfe']

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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`
  const tooltipStyle = { 
    borderRadius: 'var(--radius-md)', 
    border: 'none', 
    boxShadow: 'var(--shadow-md)', 
    backgroundColor: 'var(--bg-secondary)', 
    color: 'var(--text-primary)' 
  }

  // Aggregate daily evolution data to monthly
  const monthlyMap: Record<string, { month: string; entradas: number; saidas: number }> = {}
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

  const emptyState = (
    <div className="card w-full" style={{ opacity: 0.7 }}>
      <div className="card-body flex-row items-center gap-2">
        <span>📭</span>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>Nenhum dado neste período</p>
      </div>
    </div>
  )

  const chartHeader = (title: string) => (
    <div className="pb-4 mb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  )

  return (
    <div className="flex flex-col gap-6 mb-8">
      
      {/* Financial Evolution Line Chart */}
      <div className="card w-full">
        <div className="card-body">
          {chartHeader('Evolução Financeira')}
          {monthlyEvolutionData.length === 0 ? emptyState : (
            <div className="w-full min-w-0 overflow-hidden h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyEvolutionData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} width={80} />
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{ ...tooltipStyle, borderColor: 'var(--border-color)', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line type="monotone" name="Entradas" dataKey="entradas" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" name="Saídas" dataKey="saidas" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {insightsSlot}

      {/* Pie Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

        <div className="card w-full">
          <div className="card-body">
            {chartHeader('Entradas por Categoria')}
            {pieEntradasData.length === 0 ? emptyState : (
              <div className="w-full min-w-0 overflow-hidden h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieEntradasData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="value">
                      {pieEntradasData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_ENTRADA[index % COLORS_ENTRADA.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} contentStyle={{ ...tooltipStyle, color: '#fff' }} itemStyle={{ color: '#fff' }} labelStyle={{ color: '#fff' }} />
                    <Legend layout={isMobile ? 'horizontal' : 'vertical'} verticalAlign={isMobile ? 'bottom' : 'middle'} align={isMobile ? 'center' : 'right'} formatter={(value, entry: any) => `${value} — ${formatCurrency(entry.payload.value)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="card w-full">
          <div className="card-body">
            {chartHeader('Despesas por Categoria')}
            {pieSaidasData.length === 0 ? emptyState : (
              <div className="w-full min-w-0 overflow-hidden h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieSaidasData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="value">
                      {pieSaidasData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_SAIDA[index % COLORS_SAIDA.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} contentStyle={{ ...tooltipStyle, color: '#fff' }} itemStyle={{ color: '#fff' }} labelStyle={{ color: '#fff' }} />
                    <Legend layout={isMobile ? 'horizontal' : 'vertical'} verticalAlign={isMobile ? 'bottom' : 'middle'} align={isMobile ? 'center' : 'right'} formatter={(value, entry: any) => `${value} — ${formatCurrency(entry.payload.value)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Bar Chart — Entradas por Culto */}
      <div className="card w-full md:col-span-2">
        <div className="card-body">
          {chartHeader('Entradas por Culto')}
          {barCultoData.length === 0 ? emptyState : (
            <div className="w-full min-w-0 overflow-hidden h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barCultoData} margin={{ top: 30, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} width={80} />
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} contentStyle={{ ...tooltipStyle, color: '#fff' }} itemStyle={{ color: '#fff' }} labelStyle={{ color: '#fff' }} cursor={{ fill: 'var(--bg-tertiary)' }} />
                  <Bar dataKey="value" name="Entradas" radius={[4, 4, 0, 0]}>
                    {barCultoData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_CULTO[index % COLORS_CULTO.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
