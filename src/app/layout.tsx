import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './components.css';

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
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
