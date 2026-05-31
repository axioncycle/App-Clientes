import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import QuickAddModal from '@/components/QuickAddModal'
import InstallPWA from '@/components/InstallPWA'
import SwipeNavigation from '@/components/SwipeNavigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Axion Cycle — Gestão de Clientes',
  description: 'Sistema de gerenciamento de clientes Axion Cycle',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Clientes',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a8cff',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-[#0a0a0a] text-white min-h-screen`}>
        <Navbar />
        <SwipeNavigation>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </SwipeNavigation>
        <QuickAddModal />
        <InstallPWA />
      </body>
    </html>
  )
}
