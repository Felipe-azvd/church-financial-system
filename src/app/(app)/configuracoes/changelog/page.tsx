import { Info, CheckCircle2, RefreshCw } from 'lucide-react'

export const metadata = {
  title: 'Changelog | ChurchFep',
}

export default function ChangelogPage() {
  return (
    <div className="p-8 space-y-8 animate-[fadeIn_0.3s_ease-out] font-manrope">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Info className="text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]" /> 
          Atualizações e Novidades
        </h1>
        <p className="text-[var(--text-muted)] mt-2 italic">Acompanhe as últimas melhorias e correções do ChurchFep.</p>
      </div>

      {/* Timeline Container */}
      <div className="relative border-l border-white/10 ml-4 md:ml-6 space-y-12 pb-8">
        
        {/* Release 1.0.1 */}
        <div className="relative pl-8 md:pl-12">
          {/* Timeline Node */}
          <div className="absolute -left-2.5 top-1.5 w-5 h-5 bg-blue-500 rounded-full border-4 border-[#0a1511] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">Versão 1.0.1</h2>
            <span className="text-sm font-medium text-[var(--text-muted)]">12 de Junho de 2026</span>
          </div>

          <div className="rounded-2xl border border-[var(--border-tint)] bg-[var(--surface-tint)] p-6 md:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
            {/* Subtle glow effect in the card */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-6 relative z-10">
              
              {/* Changed Section */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-blue-400" />
                  Melhorias e Alterações
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-blue-500/30 text-blue-400 bg-blue-500/10 flex-shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                      Alterado
                    </span>
                    <span className="text-sm text-[var(--text-color)] leading-relaxed">
                      Rebranding global de texto e logos para <strong className="text-white">ChurchFep</strong>.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Fixed Section */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-amber-500" />
                  Correções de Bugs
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-amber-500/30 text-amber-500 bg-amber-500/10 flex-shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                      Corrigido
                    </span>
                    <span className="text-sm text-[var(--text-color)] leading-relaxed">
                      Hidratação da sessão do NextAuth para controle de acesso baseado em funções (RBAC).
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-amber-500/30 text-amber-500 bg-amber-500/10 flex-shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                      Corrigido
                    </span>
                    <span className="text-sm text-[var(--text-color)] leading-relaxed">
                      Grid de dados responsivo em tabelas (Fim da rolagem horizontal com o novo <em className="text-white">Mobile Card View</em>).
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-amber-500/30 text-amber-500 bg-amber-500/10 flex-shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                      Corrigido
                    </span>
                    <span className="text-sm text-[var(--text-color)] leading-relaxed">
                      Comportamento e transição do menu lateral (Sidebar) no celular.
                    </span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
