import { Info, CheckCircle2, RefreshCw } from 'lucide-react'

export const metadata = {
  title: 'Changelog | ChurchFep',
}

type ChangeItem = { tag: 'Alterado' | 'Corrigido'; text: React.ReactNode }
type VersionEntry = { version: string; date: string; changes: ChangeItem[]; fixes: ChangeItem[] }

const VERSIONS: VersionEntry[] = [
  {
    version: 'Versão 2.0.0',
    date: '3 de Agosto de 2026',
    changes: [
      { tag: 'Alterado', text: <>Redesign visual completo do sistema — nova identidade <strong>Institutional Ledger</strong>, com tipografia editorial (Newsreader + Inter), paleta navy/âmbar e tema claro como padrão.</> },
      { tag: 'Alterado', text: 'Novo modo escuro real, com contraste validado (WCAG AA/AAA) — não é mais um filtro cosmético.' },
      { tag: 'Alterado', text: 'Relatórios ganharam gráficos reais (barras e evolução no tempo), substituindo as tabelas de texto puro.' },
      { tag: 'Alterado', text: 'Janelas de cadastro (Lançamentos, Filiais, Assinaturas) padronizadas em um único componente de modal, com navegação por teclado.' },
      { tag: 'Alterado', text: 'Confirmações de exclusão e avisos passaram a usar diálogos do próprio sistema, no lugar das janelas nativas do navegador.' },
    ],
    fixes: [
      { tag: 'Corrigido', text: 'Diversos textos e cores que não apareciam corretamente por referenciar estilos inexistentes.' },
      { tag: 'Corrigido', text: 'Piscar de tela (flash) ao carregar qualquer página, antes de aplicar o tema.' },
      { tag: 'Corrigido', text: 'Contraste de botões e menus que ficavam difíceis de ler no tema claro.' },
      { tag: 'Corrigido', text: 'Acesso indevido às telas de auditoria do Super Admin por usuários sem permissão.' },
    ],
  },
  {
    version: 'Versão 1.0.1',
    date: '12 de Junho de 2026',
    changes: [
      { tag: 'Alterado', text: <>Rebranding global de texto e logos para <strong>ChurchFep</strong>.</> },
    ],
    fixes: [
      { tag: 'Corrigido', text: 'Hidratação da sessão do NextAuth para controle de acesso baseado em funções (RBAC).' },
      { tag: 'Corrigido', text: <>Grid de dados responsivo em tabelas (Fim da rolagem horizontal com o novo <em>Mobile Card View</em>).</> },
      { tag: 'Corrigido', text: 'Comportamento e transição do menu lateral (Sidebar) no celular.' },
    ],
  },
]

const BADGE_CLASS = {
  Alterado: 'border-[var(--color-primary)]/30 text-[var(--color-primary)] bg-[var(--color-primary)]/10',
  Corrigido: 'border-[var(--color-success)]/30 text-[var(--color-success)] bg-[var(--color-success)]/10',
} as const

function Badge({ tag }: { tag: ChangeItem['tag'] }) {
  return (
    <span className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase border flex-shrink-0 ${BADGE_CLASS[tag]}`}>
      {tag}
    </span>
  )
}

export default function ChangelogPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-serif font-semibold tracking-tight flex items-center gap-3">
          <Info className="w-6 h-6 text-[var(--color-primary)]" />
          Atualizações e Novidades
        </h1>
        <p className="text-[var(--text-muted)] mt-2 text-sm">Acompanhe as últimas melhorias e correções do ChurchFep.</p>
      </div>

      <div className="relative border-l border-[var(--color-base-300)] ml-4 md:ml-6 space-y-12 pb-8">
        {VERSIONS.map((entry) => (
          <div key={entry.version} className="relative pl-8 md:pl-12">
            <div className="absolute -left-2.5 top-1.5 w-5 h-5 bg-[var(--color-primary)] rounded-full border-4 border-[var(--color-base-100)]"></div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-4">
              <h2 className="text-xl font-semibold tracking-tight">{entry.version}</h2>
              <span className="text-sm font-medium text-[var(--text-muted)]">{entry.date}</span>
            </div>

            <div className="rounded-[var(--radius-box)] border border-[var(--color-base-300)] bg-[var(--color-base-100)] p-6 md:p-8 shadow-[var(--shadow-sm)]">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-[var(--color-primary)]" />
                    Melhorias e Alterações
                  </h3>
                  <ul className="space-y-3">
                    {entry.changes.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Badge tag={item.tag} />
                        <span className="text-sm leading-relaxed">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />
                    Correções de Bugs
                  </h3>
                  <ul className="space-y-3">
                    {entry.fixes.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Badge tag={item.tag} />
                        <span className="text-sm leading-relaxed">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
