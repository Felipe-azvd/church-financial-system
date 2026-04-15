'use client'

import { useState, useEffect } from 'react'
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts'

const COLORS_ENTRADA = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f43f5e']
const COLORS_SAIDA = ['#ef4444', '#f97316', '#ec4899', '#a855f7', '#eab308', '#6366f1', '#14b8a6']
const COLORS_CULTO = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899']

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
  
  // Estado para acionar a animação das barras horizontais quando carregar
  const [animateBars, setAnimateBars] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    
    // Dispara a animação logo após montar o componente
    setTimeout(() => setAnimateBars(true), 100)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`
  
  const tooltipStyle = { 
    borderRadius: '12px', 
    border: '1px solid rgba(255,255,255,0.05)', 
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', 
    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
    backdropFilter: 'blur(8px)',
    color: '#fff',
    padding: '12px'
  }

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

  // Pega o maior valor de culto para calcular as larguras proporcionais
  const maxCultoValue = barCultoData.length > 0 
    ? Math.max(...barCultoData.map(d => d.value)) 
    : 0

  const emptyState = (
    <div className="w-full h-[320px] flex flex-col items-center justify-center rounded-xl border border-dashed border-white/5 bg-black/10">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white/20 mb-3">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
      </svg>
      <p className="text-sm font-medium text-white/40">Nenhum dado neste período</p>
    </div>
  )

  const chartHeader = (title: string, subtitle: string) => (
    <div className="mb-6 relative z-10">
      <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-[var(--text-muted)]">{subtitle}</p>
    </div>
  )

  const openBoxCardClass = "rounded-2xl border border-[var(--border-tint)] bg-black/20 backdrop-blur-md p-4 sm:p-6 shadow-xl relative overflow-hidden group w-full"
  
  const GlowEffect = ({ color }: { color: string }) => (
    <div className={`absolute -bottom-20 -right-20 w-48 h-48 ${color} blur-[100px] rounded-full opacity-30 pointer-events-none group-hover:opacity-50 transition-opacity duration-500`}></div>
  )

  return (
    <div className="flex flex-col gap-6 mb-8 mt-6">
      
      {/* GRÁFICO 1: Evolução Financeira */}
      <div className={openBoxCardClass}>
        <GlowEffect color="bg-emerald-500/20" />
        {chartHeader('Evolução Financeira', 'Volume financeiro ao longo do tempo')}
        
        {monthlyEvolutionData.length === 0 ? emptyState : (
          <div className="w-full min-w-0 h-[320px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyEvolutionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} width={80} dx={-10} />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value))}
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: '#fff', fontWeight: 500, padding: '4px 0' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.6)', marginBottom: '8px', fontSize: '13px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                <Area 
                  type="monotone" 
                  name="Entradas" 
                  dataKey="entradas" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorEntradas)" 
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} 
                  style={{ filter: 'drop-shadow(0px 4px 6px rgba(16,185,129,0.3))' }}
                />
                <Area 
                  type="monotone" 
                  name="Saídas" 
                  dataKey="saidas" 
                  stroke="#ef4444" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorSaidas)" 
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#ef4444' }} 
                  style={{ filter: 'drop-shadow(0px 4px 6px rgba(239,68,68,0.3))' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {insightsSlot}

      {/* GRÁFICOS PIE (Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-2">
        <div className={openBoxCardClass}>
          <GlowEffect color="bg-emerald-500/10" />
          {chartHeader('Entradas por Categoria', 'Distribuição das receitas')}
          {pieEntradasData.length === 0 ? emptyState : (
            <div className="w-full min-w-0 h-[300px] relative z-10 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieEntradasData} cx="50%" cy="45%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none">
                    {pieEntradasData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_ENTRADA[index % COLORS_ENTRADA.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} contentStyle={tooltipStyle} itemStyle={{ color: '#fff' }} labelStyle={{ display: 'none' }} />
                  <Legend layout={isMobile ? 'horizontal' : 'vertical'} verticalAlign={isMobile ? 'bottom' : 'middle'} align={isMobile ? 'center' : 'right'} formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginLeft: '4px' }}>{value}</span>} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className={openBoxCardClass}>
          <GlowEffect color="bg-red-500/10" />
          {chartHeader('Despesas por Categoria', 'Distribuição dos gastos')}
          {pieSaidasData.length === 0 ? emptyState : (
            <div className="w-full min-w-0 h-[300px] relative z-10 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieSaidasData} cx="50%" cy="45%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none">
                    {pieSaidasData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_SAIDA[index % COLORS_SAIDA.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} contentStyle={tooltipStyle} itemStyle={{ color: '#fff' }} labelStyle={{ display: 'none' }} />
                  <Legend layout={isMobile ? 'horizontal' : 'vertical'} verticalAlign={isMobile ? 'bottom' : 'middle'} align={isMobile ? 'center' : 'right'} formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginLeft: '4px' }}>{value}</span>} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* GRÁFICO BARRAS HORIZONTAIS (Estilo Funil) */}
      <div className={openBoxCardClass}>
        <GlowEffect color="bg-blue-500/10" />
        {chartHeader('Entradas por Culto', 'Arrecadação detalhada por reunião')}
        
        {barCultoData.length === 0 ? emptyState : (
          <div className="w-full relative z-10 flex flex-col gap-6 mt-4 pb-4">
            {barCultoData.map((item, index) => {
              const color = COLORS_CULTO[index % COLORS_CULTO.length]
              // Calcula a porcentagem em relação ao maior valor para preencher a barra
              const percentage = maxCultoValue > 0 ? (item.value / maxCultoValue) * 100 : 0
              
              return (
                <div key={index} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Bolinha colorida estilo OpenBox */}
                      <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}></div>
                      <span className="text-sm font-medium text-white">{item.name}</span>
                    </div>
                    {/* Valor alinhado à direita */}
                    <span className="text-sm font-bold text-white tracking-tight">{formatCurrency(item.value)}</span>
                  </div>
                  
                  {/* Container da Barra */}
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                    {/* Barra Animada */}
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: animateBars ? `${percentage}%` : '0%', 
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}80` // Brilho suave na barra
                      }}
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