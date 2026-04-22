import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { Crown, Network, Building2, Plus, ArrowRight, Lock } from "lucide-react"
import Link from 'next/link'
import { redirect } from "next/navigation"

export default async function FiliaisPage() {
  const user = await getCurrentUser()
  if (!user?.igreja_id) redirect('/login')

  const igrejaAtual = await prisma.igreja.findUnique({
    where: { id: user.igreja_id }
  })

  // Evita erros caso a igreja tenha sumido no meio do processo
  if (!igrejaAtual) redirect('/login')

  // Checa a lógica de negócios
  const isPremium = igrejaAtual.plano === 'PREMIUM'

  // SE NÃO FOR PREMIUM: Tela de Paywall com Glassmorphism
  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] animate-[fadeIn_0.3s_ease-out]">
        <div className="max-w-xl w-full rounded-3xl border border-amber-500/20 bg-black/40 backdrop-blur-md p-10 text-center shadow-[0_0_50px_rgba(245,158,11,0.05)] relative overflow-hidden">
          {/* Brilho Superior */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 shadow-[0_0_20px_rgba(245,158,11,1)]"></div>
          
          <div className="flex justify-center mb-6 relative">
            <div className="p-5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.15)] relative">
              <Network className="w-12 h-12" />
              <div className="absolute -bottom-2 -right-2 bg-black rounded-full p-1 border border-amber-500/20">
                <Lock className="w-5 h-5 text-amber-500/80" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Gestão de Filiais</h1>
          <p className="text-[var(--text-muted)] text-lg mb-8 leading-relaxed">
            A gestão multi-tenant (Matriz e Filiais) é um recurso avançado exclusivo do plano <span className="font-bold text-amber-500 uppercase tracking-wide">Premium</span>. Centralize cadastros, relatórios e permissões de todas as congregações em um único ambiente.
          </p>

          <Link 
            href="/configuracoes/assinatura" 
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-500 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:-translate-y-1"
          >
            <Crown className="w-5 h-5" />
            Fazer Upgrade Agora
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    )
  }

  // SE FOR PREMIUM: Gerenciador de Filiais
  const filiais = await prisma.igreja.findMany({
    where: { matriz_id: igrejaAtual.id },
    orderBy: { nome: 'asc' }
  })

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out]">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <Network className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Unidades e Filiais</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1 font-medium">Gestão centralizada de congregações</p>
          </div>
        </div>
        
        {/* BOTÃO + NOVA FILIAL (Estrutura visual preparada para o modal futuro) */}
        <button 
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-white bg-amber-600 hover:bg-amber-500 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
          title="Cadastrar Nova Filial"
        >
          <Plus className="w-5 h-5" />
          Nova Filial
        </button>
      </div>

      {/* LISTA DE FILIAIS (Tabela Glassmorphism) */}
      <div className="rounded-2xl border border-white/10 bg-[#0B1121]/50 backdrop-blur-md shadow-2xl relative overflow-hidden flex flex-col">
        <div className="overflow-x-auto relative z-10 w-full">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 text-sm font-medium text-[var(--text-muted)] bg-white/[0.01]">
                <th className="py-4 pl-6 font-semibold">Nome da Filial</th>
                <th className="py-4 font-semibold">Status</th>
                <th className="py-4 text-right pr-6 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filiais.map((filial) => (
                <tr key={filial.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-amber-500/70 shadow-[0_0_10px_rgba(245,158,11,0.05)]">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-white">{filial.nome}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    {filial.ativo ? (
                      <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                        Ativa
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                        Bloqueada
                      </span>
                    )}
                  </td>
                  <td className="py-4 text-right pr-6">
                    <button className="text-xs px-4 py-2 rounded-lg font-semibold bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 transition-all opacity-80 group-hover:opacity-100 shadow-[0_0_10px_rgba(245,158,11,0.1)] hover:shadow-lg">
                      Gerenciar
                    </button>
                  </td>
                </tr>
              ))}
              
              {/* ESTADO VAZIO */}
              {filiais.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-16 text-center">
                    <Network className="w-12 h-12 text-white/5 mx-auto mb-4" />
                    <p className="text-base text-[var(--text-muted)] font-medium">Nenhuma filial localizada.</p>
                    <p className="text-sm text-white/30 mt-1">Clique em 'Nova Filial' para adicionar a primeira congregação à Matriz.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
