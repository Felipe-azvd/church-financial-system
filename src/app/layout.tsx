import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
// import './components.css'; // Mantenha comentado ou ativo se você tiver esse arquivo
import { ThemeProvider } from '@/components/ThemeProvider'; // Verifique se o caminho está correto

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Church Financial System',
  description: 'Gestão Financeira para Igrejas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}