import type { Metadata } from 'next';
import { Inter, Newsreader } from 'next/font/google';
import './globals.css';
import ThemeProvider from '@/components/ThemeProvider';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const newsreader = Newsreader({
  weight: ['500', '600'],
  subsets: ['latin'],
  variable: '--font-newsreader',
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
    <html lang="pt-BR" suppressHydrationWarning className={`${newsreader.variable} ${inter.variable}`}>
      <body className="font-sans">
        <ThemeProvider>
          <ToastProvider>
            <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-color)]">
              {children}
            </div>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}