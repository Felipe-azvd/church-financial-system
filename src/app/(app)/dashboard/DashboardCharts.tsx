'use client'

import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  BarChart, Bar 
} from 'recharts'

const COLORS_ENTRADA = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0']
const COLORS_SAIDA = ['#ef4444', '#dc2626', '#f87171', '#fca5a5', '#fecaca']
const COLORS_CULTO = ['#3b82f6', '#2563eb', '#60a5fa', '#93c5fd', '#bfdbfe']

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

  const hasData = evolutionData.length > 0 || pieEntradasData.length > 0 || pieSaidasData.length > 0 || barCultoData.length > 0

  if (!hasData) {
    return (
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-muted)' }}>
        Nenhum dado financeiro para o período selecionado.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
      
      {/* ROW 2: Financial Evolution */}
      {evolutionData.length > 0 && (
        <div className="card" style={{ height: '350px', padding: 'var(--spacing-md)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1rem', color: 'var(--text-secondary)' }}>
            Evolução Financeira
          </h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} width={80} />
              <Tooltip 
                formatter={(value: any) => formatCurrency(Number(value))}
                contentStyle={{ ...tooltipStyle, borderColor: 'var(--border-color)', color: '#FFFFFF' }}
                itemStyle={{ color: '#FFFFFF' }}
                labelStyle={{ color: '#FFFFFF' }}
              />
              <Legend />
              <Line type="monotone" name="Entradas" dataKey="entradas" stroke="var(--success)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              <Line type="monotone" name="Saídas" dataKey="saidas" stroke="var(--danger)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ROW 3: Categories Pie Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 'var(--spacing-xl)' }}>
        
        {pieEntradasData.length > 0 && (
          <div className="card" style={{ height: '420px', padding: 'var(--spacing-md)' }}>
             <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              Entradas por Categoria
            </h3>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={pieEntradasData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieEntradasData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_ENTRADA[index % COLORS_ENTRADA.length]} />
                  ))}
                </Pie>
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  formatter={(value, entry: any) => `${value} — ${formatCurrency(entry.payload.value)}`} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {pieSaidasData.length > 0 && (
          <div className="card" style={{ height: '420px', padding: 'var(--spacing-md)' }}>
             <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              Saídas por Categoria
            </h3>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={pieSaidasData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieSaidasData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_SAIDA[index % COLORS_SAIDA.length]} />
                  ))}
                </Pie>
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  formatter={(value, entry: any) => `${value} — ${formatCurrency(entry.payload.value)}`} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>

      {/* ROW 4: Entradas by Culto Bar Chart */}
      {barCultoData.length > 0 && (
        <div className="card" style={{ height: '350px', padding: 'var(--spacing-md)' }}>
           <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1rem', color: 'var(--text-secondary)' }}>
            Entradas por Culto
          </h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={barCultoData} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} width={80} />
              <Tooltip 
                formatter={(value: any) => formatCurrency(Number(value))} 
                contentStyle={{ ...tooltipStyle, borderColor: 'var(--border-color)', color: '#FFFFFF' }} 
                itemStyle={{ color: '#FFFFFF' }}
                labelStyle={{ color: '#FFFFFF' }}
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
        </div>
      )}

    </div>
  )
}
