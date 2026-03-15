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
  const currentMonthIdx = now.getMonth()   // 0-based
  const prevMonthIdx = currentMonthIdx > 0 ? currentMonthIdx - 1 : null

  const current = monthlyTotals[currentMonthIdx] ?? { entradas: 0, saidas: 0 }
  const prev = prevMonthIdx !== null ? monthlyTotals[prevMonthIdx] : null

  // Check if there's any real data at all
  const hasAnyData = monthlyTotals.some(m => m.entradas > 0 || m.saidas > 0)

  type Insight = {
    type: 'success' | 'warning' | 'info'
    icon: string
    message: string
  }

  const insights: Insight[] = []

  if (hasAnyData) {
    // 1. Revenue trend
    if (prev !== null) {
      const revPct = pct(current.entradas, prev.entradas)
      if (revPct !== null) {
        if (revPct >= 0) {
          insights.push({
            type: 'success',
            icon: '📈',
            message: `Entradas cresceram ${revPct.toFixed(1)}% em relação ao mês anterior (${MONTH_NAMES[prevMonthIdx!]}).`
          })
        } else {
          insights.push({
            type: 'warning',
            icon: '📉',
            message: `Entradas caíram ${Math.abs(revPct).toFixed(1)}% em relação ao mês anterior (${MONTH_NAMES[prevMonthIdx!]}).`
          })
        }
      } else if (current.entradas > 0) {
        insights.push({
          type: 'success',
          icon: '🎉',
          message: `Primeiro registro de entradas em ${MONTH_NAMES[currentMonthIdx]}: ${fmt(current.entradas)}.`
        })
      }
    }

    // 2. Expense trend
    if (prev !== null) {
      const expPct = pct(current.saidas, prev.saidas)
      if (expPct !== null) {
        if (expPct > 10) {
          insights.push({
            type: 'warning',
            icon: '⚠️',
            message: `Despesas aumentaram ${expPct.toFixed(1)}% em relação ao mês anterior. Atenção ao orçamento.`
          })
        } else if (expPct < -5) {
          insights.push({
            type: 'success',
            icon: '✅',
            message: `Despesas reduziram ${Math.abs(expPct).toFixed(1)}% em relação ao mês anterior.`
          })
        } else {
          insights.push({
            type: 'info',
            icon: '📊',
            message: `Despesas estáveis em relação ao mês anterior.`
          })
        }
      }
    }

    // 3. Financial health — current month
    const saldoMes = current.entradas - current.saidas
    if (current.entradas > 0 || current.saidas > 0) {
      if (saldoMes < 0) {
        insights.push({
          type: 'warning',
          icon: '🚨',
          message: `Atenção: despesas superaram receitas em ${MONTH_NAMES[currentMonthIdx]}. Saldo negativo de ${fmt(Math.abs(saldoMes))}.`
        })
      } else if (saldoMes > 0) {
        insights.push({
          type: 'success',
          icon: '💚',
          message: `Saldo positivo em ${MONTH_NAMES[currentMonthIdx]}: ${fmt(saldoMes)}.`
        })
      }
    }

    // 4. Consecutive positive months (last 3)
    const last3 = monthlyTotals.slice(Math.max(0, currentMonthIdx - 2), currentMonthIdx + 1)
    const allPositive = last3.length === 3 && last3.every(m => m.entradas > m.saidas)
    if (allPositive) {
      insights.push({
        type: 'success',
        icon: '🏆',
        message: `Saldo positivo nos últimos 3 meses consecutivos. Excelente saúde financeira!`
      })
    }
  }

  const alertClass = {
    success: 'alert alert-soft alert-success',
    warning: 'alert alert-soft alert-warning',
    info:    'alert alert-soft alert-info'
  }

  return (
    <div className="card" style={{ padding: 0, marginBottom: 'var(--spacing-xl)' }}>
      <div className="card-body" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <h2 className="card-title" style={{ fontSize: '1.125rem' }}>Insights Financeiros</h2>
      </div>
      <div style={{ padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        {insights.length === 0 ? (
          <div className="alert alert-soft alert-info">
            Dados insuficientes para gerar insights.
          </div>
        ) : (
          insights.map((insight, i) => (
            <div key={i} className={alertClass[insight.type]} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{insight.icon}</span>
              <span>{insight.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
