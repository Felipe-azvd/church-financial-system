import type { Metadata } from 'next';
import { Manrope, Sulphur_Point } from 'next/font/google';
import './globals.css';
import ThemeProvider from '@/components/ThemeProvider'; 

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });
const sulphurPoint = Sulphur_Point({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-sulphur-point',
  display: 'swap',
});

// AQUI: Injetamos o Favicon e o Slogan Oficial!
export const metadata: Metadata = {
  title: 'ChurchFep | Inovação com propósito',
  description: 'Gestão inteligente para igrejas modernas',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${sulphurPoint.variable} ${manrope.variable} dark`}>
      <body className="font-sans bg-neutral-dark text-accent">
        <ThemeProvider>
          {/* Fundo dinâmico da página inteira (Pega no Login e no App) */}
          <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-color)] transition-colors duration-500 relative">
            
            {/* Luzes de Fundo Globais */}
            <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-[var(--primary-color)] opacity-[0.08] rounded-full blur-[128px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0 hidden md:block transition-colors duration-500"></div>
            
            <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-[var(--primary-color)] opacity-[0.05] rounded-full blur-[128px] pointer-events-none translate-x-1/2 translate-y-1/2 z-0 hidden md:block transition-colors duration-500"></div>

            <div className="relative z-10 w-full h-full">
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}