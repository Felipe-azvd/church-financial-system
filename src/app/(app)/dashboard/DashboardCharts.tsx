'use client'

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
  barCultoData
}: { 
  evolutionData: EvolutionData[]
  pieEntradasData: ChartData[]
  pieSaidasData: ChartData[]
  barCultoData: ChartData[]
}) {
  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`
  const tooltipStyle = { 
    borderRadius: 'var(--radius-md)', 
    border: 'none', 
    boxShadow: 'var(--shadow-md)', 
    backgroundColor: 'var(--bg-secondary)', 
    color: 'var(--text-primary)' 
  }

  // Aggregate daily evolution data to monthly for the line chart
  const monthlyMap: Record<string, { month: string; entradas: number; saidas: number }> = {}
  evolutionData.forEach((d) => {
    // date format is "DD/MM"
    const parts = d.date.split('/')
    const monthKey = parts[1] // MM
    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { month: MONTH_NAMES[monthKey] || monthKey, entradas: 0, saidas: 0 }
    }
    monthlyMap[monthKey].entradas += d.entradas
    monthlyMap[monthKey].saidas += d.saidas
  })
  const monthlyEvolutionData = Object.keys(monthlyMap)
    .sort()
    .map((k) => monthlyMap[k])

  const emptyState = (
    <div className="alert alert-soft alert-info" style={{ margin: 'var(--spacing-md)' }}>
      Sem dados suficientes para gerar gráfico.
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
      
      {/* Financial Evolution Line Chart */}
      <div className="card" style={{ padding: 0 }}>
        <div className="card-body" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <h2 className="card-title" style={{ fontSize: '1.125rem' }}>Evolução Financeira</h2>
        </div>
        <div style={{ padding: 'var(--spacing-md)' }}>
          {monthlyEvolutionData.length === 0 ? emptyState : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyEvolutionData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
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
          )}
        </div>
      </div>

      {/* Pie Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--spacing-xl)' }}>

        {/* Income by Category */}
        <div className="card" style={{ padding: 0 }}>
          <div className="card-body" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <h2 className="card-title" style={{ fontSize: '1.125rem' }}>Entradas por Categoria</h2>
          </div>
          <div style={{ padding: 'var(--spacing-md)' }}>
            {pieEntradasData.length === 0 ? emptyState : (
              <ResponsiveContainer width="100%" height={360}>
                <PieChart>
                  <Pie
                    data={pieEntradasData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={115}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieEntradasData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_ENTRADA[index % COLORS_ENTRADA.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{ ...tooltipStyle, color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    formatter={(value, entry: any) => `${value} — ${formatCurrency(entry.payload.value)}`} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="card" style={{ padding: 0 }}>
          <div className="card-body" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <h2 className="card-title" style={{ fontSize: '1.125rem' }}>Despesas por Categoria</h2>
          </div>
          <div style={{ padding: 'var(--spacing-md)' }}>
            {pieSaidasData.length === 0 ? emptyState : (
              <ResponsiveContainer width="100%" height={360}>
                <PieChart>
                  <Pie
                    data={pieSaidasData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={115}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieSaidasData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_SAIDA[index % COLORS_SAIDA.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{ ...tooltipStyle, color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    formatter={(value, entry: any) => `${value} — ${formatCurrency(entry.payload.value)}`} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Entradas by Culto Bar Chart */}
      <div className="card" style={{ padding: 0 }}>
        <div className="card-body" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <h2 className="card-title" style={{ fontSize: '1.125rem' }}>Entradas por Culto</h2>
        </div>
        <div style={{ padding: 'var(--spacing-md)' }}>
          {barCultoData.length === 0 ? emptyState : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barCultoData} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} width={80} />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value))} 
                  contentStyle={{ ...tooltipStyle, borderColor: 'var(--border-color)', color: '#fff' }} 
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                  cursor={{ fill: 'var(--bg-tertiary)' }} 
                />
                <Bar 
                  dataKey="value" 
                  name="Entradas" 
                  radius={[4, 4, 0, 0]}
                  label={{ position: 'top', fill: '#E2E8F0', fontWeight: 500, formatter: (val: any) => formatCurrency(Number(val)) }}
                >
                  {barCultoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_CULTO[index % COLORS_CULTO.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  )
}
