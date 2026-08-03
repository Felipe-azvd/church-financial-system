import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, AlertOctagon, Trophy, Minus, Inbox, type LucideIcon } from 'lucide-react'

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

type MonthTotals = { entradas: number; saidas: number }

function fmt(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}

type Insight = {
  color: string
  icon: LucideIcon
  message: string
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

  const insights: Insight[] = []

  if (hasAnyData) {
    if (prev !== null) {
      const revPct = prev.entradas === 0 ? null : ((current.entradas - prev.entradas) / prev.entradas) * 100
      if (revPct !== null) {
        if (revPct >= 0) {
          insights.push({ color: 'var(--color-success)', icon: TrendingUp, message: `Entradas cresceram ${revPct.toFixed(1)}% em relação ao mês anterior (${MONTH_NAMES[prevMonthIdx!]}).` })
        } else {
          insights.push({ color: 'var(--color-warning)', icon: TrendingDown, message: `Entradas caíram ${Math.abs(revPct).toFixed(1)}% em relação ao mês anterior (${MONTH_NAMES[prevMonthIdx!]}).` })
        }
      }
    }

    if (prev !== null && prev.saidas > 0) {
      const expPct = ((current.saidas - prev.saidas) / prev.saidas) * 100
      if (expPct > 10) {
        insights.push({ color: 'var(--color-warning)', icon: AlertTriangle, message: `Despesas aumentaram ${expPct.toFixed(1)}% em relação ao mês anterior.` })
      } else if (expPct < -5) {
        insights.push({ color: 'var(--color-success)', icon: CheckCircle2, message: `Despesas reduziram ${Math.abs(expPct).toFixed(1)}% em relação ao mês anterior.` })
      } else {
        insights.push({ color: 'var(--text-muted)', icon: Minus, message: `Despesas estáveis em relação ao mês anterior.` })
      }
    }

    const saldoMes = current.entradas - current.saidas
    if (current.entradas > 0 || current.saidas > 0) {
      if (saldoMes < 0) {
        insights.push({ color: 'var(--color-error)', icon: AlertOctagon, message: `Atenção: despesas superaram receitas em ${MONTH_NAMES[currentMonthIdx]}. Saldo: ${fmt(saldoMes)}.` })
      } else if (saldoMes > 0) {
        insights.push({ color: 'var(--color-success)', icon: CheckCircle2, message: `Saldo positivo em ${MONTH_NAMES[currentMonthIdx]}: ${fmt(saldoMes)}.` })
      }
    }

    const last3 = monthlyTotals.slice(Math.max(0, currentMonthIdx - 2), currentMonthIdx + 1)
    if (last3.length === 3 && last3.every(m => m.entradas > m.saidas)) {
      insights.push({ color: 'var(--color-success)', icon: Trophy, message: `Saldo positivo nos últimos 3 meses consecutivos!` })
    }
  }

  return (
    <div className="rounded-[var(--radius-box)] border border-[var(--color-base-300)] bg-[var(--color-base-100)] shadow-[var(--shadow-sm)]">
      <div className="p-6 border-b border-[var(--color-base-300)]">
        <h2 className="text-lg font-semibold">Insights Financeiros</h2>
      </div>
      <div className="p-6">
        {insights.length === 0 ? (
          <div className="flex items-center gap-3 text-[var(--text-muted)]">
            <Inbox className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">Nenhum dado neste período</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {insights.map((insight, i) => {
              const Icon = insight.icon
              return (
                <li key={i} className="flex items-center gap-3 text-sm font-medium" style={{ color: insight.color }}>
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {insight.message}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
