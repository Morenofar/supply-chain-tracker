import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Web3Provider } from '@/contexts/Web3Context';
import { Header } from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Supply Chain Tracker - DApp',
  description: 'Sistema de trazabilidad blockchain con ERC-1155',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={inter.className}>
        <Web3Provider>
          <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </Web3Provider>
      </body>
    </html>
  );
}


