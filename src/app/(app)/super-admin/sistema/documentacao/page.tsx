import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  BookOpen, Server, Building2, Users, Crown, ShieldCheck,
  Palette, AlertTriangle, Smartphone, FolderTree, type LucideIcon
} from "lucide-react"

function Section({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-box)] border border-[var(--color-base-300)] bg-[var(--color-base-100)] p-6 md:p-8 shadow-[var(--shadow-sm)]">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Icon className="w-5 h-5 text-[var(--color-accent)]" />
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-[var(--text-color)]">
        {children}
      </div>
    </div>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded bg-[var(--color-base-200)] text-[var(--color-primary)] text-[13px] font-mono">
      {children}
    </code>
  )
}

export default async function DocumentacaoPage() {
  const user = await getCurrentUser()

  if (!user || !user.permissions.includes('*')) {
    redirect('/dashboard')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 rounded-[var(--radius-field)] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30">
          <BookOpen className="w-6 h-6 text-[var(--color-accent)]" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-semibold tracking-tight">Documentação do Sistema</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Como o ChurchFep funciona por dentro — uso exclusivo do Super Admin.</p>
        </div>
      </div>

      <div className="flex flex-col gap-5">

        <Section icon={BookOpen} title="Visão geral">
          <p>
            O ChurchFep é um SaaS de gestão financeira para igrejas: cada igreja é um <strong>tenant</strong> (cliente)
            isolado, com seus próprios lançamentos, categorias, cultos e usuários. Uma mesma conta pode administrar
            várias igrejas — inclusive redes de matriz e filiais que compartilham o mesmo administrador.
          </p>
          <p>
            Você (Felipe) é o <strong>Super Admin</strong>: além de administrar sua própria igreja, tem um painel
            à parte para gerenciar todos os clientes da plataforma, ver auditoria global e controlar assinaturas.
          </p>
        </Section>

        <Section icon={Server} title="Arquitetura técnica">
          <p>O sistema é construído em cima de quatro peças principais:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Next.js</strong> — o framework que gera as páginas e roda a lógica do servidor. A maior parte das telas busca dados diretamente no banco no servidor (sem uma API separada no meio).</li>
            <li><strong>Prisma</strong> — a camada que traduz o código em consultas SQL pro banco de dados, de forma segura.</li>
            <li><strong>Neon</strong> — o banco de dados (PostgreSQL) onde tudo é armazenado, incluindo os dados financeiros reais.</li>
            <li><strong>Netlify</strong> — onde o site fica hospedado. Todo <Code>git push</Code> na branch <Code>main</Code> do GitHub gera um deploy automático em produção.</li>
          </ul>
        </Section>

        <Section icon={Building2} title="Modelo multi-tenant (matriz e filiais)">
          <p>
            Cada igreja tem um <Code>igreja_id</Code> próprio. Todo dado financeiro (lançamentos, categorias, cultos,
            usuários, funções) é gravado e consultado sempre filtrado por esse ID — isso é o que garante que uma
            igreja nunca veja dado de outra.
          </p>
          <p>
            Quando uma igreja está no plano <strong>PREMIUM</strong> e tem uma <Code>matriz_id</Code> definida, ela faz
            parte de uma rede: a matriz e todas as filiais aparecem juntas no seletor de igreja da barra lateral,
            e o usuário pode trocar entre elas sem precisar de outro login.
          </p>
        </Section>

        <Section icon={Users} title="Papéis e permissões">
          <p>Dentro de uma igreja, cada usuário tem uma função (role) com permissões específicas:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Membro</strong> — acesso só de leitura a dashboard e relatórios.</li>
            <li><strong>Tesouraria</strong> — pode lançar, editar e visualizar lançamentos, relatórios e dashboard.</li>
            <li><strong>Administrador</strong> — acesso completo à igreja: usuários, funções, configurações, tudo exceto o painel Super Admin.</li>
          </ul>
          <p>
            A permissão coringa <Code>*</Code> (que só o Super Admin tem) libera acesso irrestrito a qualquer
            verificação de permissão do sistema, em qualquer igreja.
          </p>
        </Section>

        <Section icon={Crown} title="Painel Super Admin">
          <p>Só você enxerga o menu "Painel Master" (ícone de coroa). Ele tem 5 áreas:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Visão Geral</strong> — números gerais da plataforma (igrejas ativas, usuários, crescimento).</li>
            <li><strong>Gerenciar Igrejas</strong> — lista de todos os clientes, com opção de bloquear/liberar acesso e entrar como suporte.</li>
            <li><strong>Auditoria</strong> — histórico de ações críticas, separado em "Clientes" (o que os clientes fazem) e "Super Admin" (suas próprias ações administrativas).</li>
            <li><strong>Assinaturas</strong> — controle de plano e vencimento de cada igreja.</li>
            <li><strong>Sistema</strong> — esta documentação e o changelog interno.</li>
          </ul>
          <p>
            O botão <strong>"Acessar"</strong> em Gerenciar Igrejas ativa o <strong>modo suporte</strong>: você passa a
            ver o sistema exatamente como aquele cliente vê, sem precisar da senha dele. O botão <strong>"Encerrar
            Suporte"</strong> na barra lateral volta pro seu próprio painel.
          </p>
        </Section>

        <Section icon={ShieldCheck} title="Segurança">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Toda consulta a dado de tenant passa por uma camada que injeta automaticamente o filtro por <Code>igreja_id</Code> — não é possível, mesmo por engano no código, uma tela buscar dado de outra igreja sem essa trava.</li>
            <li>Senhas são armazenadas com hash (nunca em texto puro).</li>
            <li>Login é bloqueado por 15 minutos após 5 tentativas erradas seguidas.</li>
            <li>Tokens de recuperação de senha são de uso único, expiram em pouco tempo e são armazenados com hash (não em texto puro) no banco.</li>
          </ul>
        </Section>

        <Section icon={Palette} title="Redesign visual — Institutional Ledger">
          <p>
            Em agosto de 2026 o visual inteiro do sistema foi refeito: tema claro como padrão (com um modo escuro
            real, não só um filtro), tipografia editorial (Newsreader para títulos, Inter para o resto), paleta
            navy/âmbar, e um sistema único de cores/espaçamento/sombra em vez das dezenas de valores soltos que
            existiam antes. O objetivo foi transmitir a seriedade de um sistema financeiro institucional.
          </p>
        </Section>

        <Section icon={AlertTriangle} title="Infraestrutura e limitações conhecidas">
          <p>
            O banco de dados (Neon) está no <strong>plano gratuito</strong>, que hiberna automaticamente após ~5
            minutos sem uso. A primeira requisição depois desse período pode falhar ou demorar um pouco enquanto o
            banco "acorda".
          </p>
          <p>Duas mitigações já ativas:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Um endpoint <Code>/api/health</Code> é chamado a cada 5 minutos por um cron do GitHub Actions, pra manter o banco sempre ativo.</li>
            <li>Toda consulta ao banco tenta de novo automaticamente se falhar por um erro de conexão transitório.</li>
          </ul>
          <p>
            Isso reduz bastante o problema, mas não elimina 100% o risco (o agendamento do GitHub Actions não é
            garantido no minuto exato). A solução definitiva é fazer upgrade do plano do Neon (a partir de ~US$19/mês),
            que permite desativar a hibernação por completo.
          </p>
        </Section>

        <Section icon={Smartphone} title="PWA — instalar como aplicativo">
          <p>
            Desde agosto de 2026 o ChurchFep pode ser instalado como aplicativo no Android, direto pelo Chrome
            ("Instalar app" no menu) — ganha ícone próprio e abre em tela cheia, sem virar um app nativo de verdade.
          </p>
          <p>
            O app não funciona offline (todo dado é dinâmico e depende do servidor) — a única exceção é uma tela
            simples avisando que não há conexão, caso a internet caia.
          </p>
          <p>
            iOS não tem um caminho equivalente de instalação — é uma limitação da Apple, não do sistema. Publicar
            nas lojas de aplicativo (Play Store e App Store) é possível no futuro: o caminho mais barato é empacotar
            esta mesma PWA via TWA do Google (~US$25 taxa única) para o Android; a App Store exige conta de
            desenvolvedor Apple (~US$99/ano) e um Mac para compilar.
          </p>
        </Section>

        <Section icon={FolderTree} title="Onde estão as coisas">
          <ul className="list-disc pl-5 space-y-1.5">
            <li><Code>src/app/(app)/</Code> — todas as páginas internas do sistema (dashboard, lançamentos, super-admin etc.), organizadas por rota.</li>
            <li><Code>src/app/actions/</Code> — as Server Actions (funções que rodam no servidor a partir de formulários/botões).</li>
            <li><Code>src/components/</Code> — componentes reutilizáveis (Sidebar, modais, formulários).</li>
            <li><Code>src/lib/auth.ts</Code> — sessão, permissões e resolução de qual igreja está ativa.</li>
            <li><Code>src/lib/prisma-tenant.ts</Code> — a camada que garante o isolamento por igreja em toda consulta.</li>
            <li><Code>prisma/schema.prisma</Code> — o desenho de todas as tabelas do banco de dados.</li>
            <li><Code>.github/workflows/</Code> — automações agendadas (atualização dos dados de demonstração, aquecimento do banco).</li>
          </ul>
        </Section>

      </div>
    </div>
  )
}
