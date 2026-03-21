import React from 'react'

export default function FinancialSummary({
  ano,
  entradas,
  saidas,
  saldo,
  melhorMes,
  maiorDespesa,
  mediaMensal
}: {
  ano: number
  entradas: number
  saidas: number
  saldo: number
  melhorMes: string
  maiorDespesa: string
  mediaMensal: number
}) {
  return (
    <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
      <h2 style={{ 
        marginBottom: 'var(--spacing-md)', 
        fontSize: '1.25rem', 
        color: 'var(--text-primary)' 
      }}>
        Resumo Financeiro {ano}
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--spacing-md)'
      }}>
        <div className="card w-full">
          <div className="card-body">
            <h3 className="text-sm font-medium mb-3">Entradas totais</h3>
            <p className="text-xl font-semibold" style={{ color: 'var(--success)' }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(entradas)}
            </p>
          </div>
        </div>
        
        <div className="card w-full">
          <div className="card-body">
            <h3 className="text-sm font-medium mb-3">Saídas totais</h3>
            <p className="text-xl font-semibold" style={{ color: 'var(--danger)' }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saidas)}
            </p>
          </div>
        </div>

        <div className="card w-full">
          <div className="card-body">
            <h3 className="text-sm font-medium mb-3">Saldo anual</h3>
            <p className="text-xl font-semibold" style={{ color: saldo >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldo)}
            </p>
          </div>
        </div>

        <div className="card w-full">
          <div className="card-body">
            <h3 className="text-sm font-medium mb-3">Melhor mês</h3>
            <p className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {melhorMes}
            </p>
          </div>
        </div>

        <div className="card w-full">
          <div className="card-body">
            <h3 className="text-sm font-medium mb-3">Maior despesa</h3>
            <p className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {maiorDespesa}
            </p>
          </div>
        </div>

        <div className="card w-full">
          <div className="card-body">
            <h3 className="text-sm font-medium mb-3">Média mensal</h3>
            <p className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mediaMensal)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
