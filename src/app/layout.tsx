import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Axion Cycle',
  description: 'Gestão Integrada Axion Cycle',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Axion Cycle',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a8cff',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-[#0a0a0a] text-white min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
