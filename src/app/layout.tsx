import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import QuickAddModal from '@/components/QuickAddModal'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bike Shop - Gestão de Clientes',
  description: 'Sistema de gerenciamento de clientes para bike shop',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-900 text-slate-100 min-h-screen`}>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <QuickAddModal />
      </body>
    </html>
  )
}
