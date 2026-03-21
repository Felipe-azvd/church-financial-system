import React from 'react'

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

type MonthTotals = { entradas: number; saidas: number }

function pct(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}

function fmt(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}

export default function FinancialInsights({
  monthlyTotals
}: {
  monthlyTotals: MonthTotals[]
}) {
  const now = new Date()
  const currentMonthIdx = now.getMonth()
  const prevMonthIdx = currentMonthIdx > 0 ? currentMonthIdx - 1 : null

  const current = monthlyTotals[currentMonthIdx] ?? { entradas: 0, saidas: 0 }
  const prev = prevMonthIdx !== null ? monthlyTotals[prevMonthIdx] : null

  const hasAnyData = monthlyTotals.some(m => m.entradas > 0 || m.saidas > 0)

  type Insight = {
    color: string
    icon: string
    message: string
  }

  const insights: Insight[] = []

  if (hasAnyData) {
    // Revenue trend
    if (prev !== null) {
      const revPct = prev.entradas === 0 ? null : ((current.entradas - prev.entradas) / prev.entradas) * 100
      if (revPct !== null) {
        if (revPct >= 0) {
          insights.push({ color: 'var(--success)', icon: '📈', message: `Entradas cresceram ${revPct.toFixed(1)}% em relação ao mês anterior (${MONTH_NAMES[prevMonthIdx!]}).` })
        } else {
          insights.push({ color: 'var(--warning)', icon: '📉', message: `Entradas caíram ${Math.abs(revPct).toFixed(1)}% em relação ao mês anterior (${MONTH_NAMES[prevMonthIdx!]}).` })
        }
      }
    }

    // Expense trend
    if (prev !== null && prev.saidas > 0) {
      const expPct = ((current.saidas - prev.saidas) / prev.saidas) * 100
      if (expPct > 10) {
        insights.push({ color: 'var(--warning)', icon: '⚠️', message: `Despesas aumentaram ${expPct.toFixed(1)}% em relação ao mês anterior.` })
      } else if (expPct < -5) {
        insights.push({ color: 'var(--success)', icon: '✅', message: `Despesas reduziram ${Math.abs(expPct).toFixed(1)}% em relação ao mês anterior.` })
      } else {
        insights.push({ color: 'var(--text-secondary)', icon: '📊', message: `Despesas estáveis em relação ao mês anterior.` })
      }
    }

    // Financial health — current month
    const saldoMes = current.entradas - current.saidas
    if (current.entradas > 0 || current.saidas > 0) {
      if (saldoMes < 0) {
        insights.push({ color: 'var(--danger)', icon: '🚨', message: `Atenção: despesas superaram receitas em ${MONTH_NAMES[currentMonthIdx]}. Saldo: ${fmt(saldoMes)}.` })
      } else if (saldoMes > 0) {
        insights.push({ color: 'var(--success)', icon: '💚', message: `Saldo positivo em ${MONTH_NAMES[currentMonthIdx]}: ${fmt(saldoMes)}.` })
      }
    }

    // 3-month positive streak
    const last3 = monthlyTotals.slice(Math.max(0, currentMonthIdx - 2), currentMonthIdx + 1)
    if (last3.length === 3 && last3.every(m => m.entradas > m.saidas)) {
      insights.push({ color: 'var(--success)', icon: '🏆', message: `Saldo positivo nos últimos 3 meses consecutivos!` })
    }
  }

  return (
    <div className="card w-full">
      <div className="card-body" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <h2 className="text-lg font-semibold mb-3">Insights Financeiros</h2>
      </div>
      <div className="card-body">
        {insights.length === 0 ? (
          <div className="card w-full" style={{ opacity: 0.7 }}>
            <div className="card-body flex-row items-center gap-3">
              <span style={{ fontSize: 'var(--text-xl)' }}>📭</span>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>Nenhum dado neste período</p>
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {insights.map((insight, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-medium" style={{ color: insight.color }}>
                <span className="text-xl flex-shrink-0">{insight.icon}</span>
                {insight.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
