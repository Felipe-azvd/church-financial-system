export const CHART_PALETTE = [
  'var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)',
  'var(--chart-5)', 'var(--chart-6)', 'var(--chart-7)',
]

export function colorForCategory(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  return CHART_PALETTE[Math.abs(hash) % CHART_PALETTE.length]
}

export const chartTooltipStyle = {
  borderRadius: 'var(--radius-field)',
  border: '1px solid var(--color-base-300)',
  boxShadow: 'var(--shadow-md)',
  backgroundColor: 'var(--color-base-100)',
  color: 'var(--color-base-content)',
  padding: '12px',
}
