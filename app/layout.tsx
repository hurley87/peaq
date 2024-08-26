import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ParticleConnectkit } from '@/components/connectkit';
import CheckChain from '@/components/check-chain';
import Header from '@/components/header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ParticleConnectkit>
          <div className="flex flex-col">
            <CheckChain />
            <Header />
            <div>{children}</div>
          </div>
        </ParticleConnectkit>
      </body>
    </html>
  );
}
