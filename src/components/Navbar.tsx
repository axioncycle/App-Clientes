'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'

const navLinks = [
  { href: '/clientes',            label: 'DASHBOARD', icon: '📊' },
  { href: '/clientes/customers',  label: 'CLIENTES',  icon: '👥' },
  { href: '/clientes/funil',      label: 'FUNIL',     icon: '🎯' },
  { href: '/clientes/follow-ups', label: 'FOLLOW-UP', icon: '🔔' },
  { href: '/clientes/tags',       label: 'TAGS',      icon: '🏷️' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 border-b" style={{ backgroundColor: 'var(--nav-bg)', borderColor: 'var(--border)' }}>
      {/* Back to modules + header row */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo + title */}
        <Link href="/clientes" className="flex items-center gap-3 flex-shrink-0">
          <div className="w-11 h-11 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center overflow-hidden flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Axion Cycle"
              className="w-full h-full object-contain p-0.5"
              onError={(e) => {
                const t = e.currentTarget
                t.style.display = 'none'
                const parent = t.parentElement
                if (parent) parent.innerHTML = '<span style="font-size:22px">🚲</span>'
              }}
            />
          </div>
          <div>
            <p className="font-black text-base text-[#1a8cff] tracking-widest leading-none uppercase">Axion Cycle</p>
            <p className="text-[10px] text-gray-400 tracking-widest uppercase leading-none mt-0.5">Gestão Integrada</p>
          </div>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/"
            className="text-[10px] font-bold tracking-wider text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded-lg border border-transparent hover:border-gray-600"
            title="Módulos"
          >
            ← MÓDULOS
          </Link>
          <ThemeToggle />
          <button
            onClick={() => window.location.reload()}
            className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all"
            style={{ backgroundColor: 'var(--bg3)', borderColor: 'var(--border2)', color: 'var(--text2)' }}
            title="Atualizar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <Link
            href="/clientes/customers/new"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xl transition-colors"
            style={{ backgroundColor: 'var(--blue)' }}
            title="Novo Cliente"
          >
            +
          </Link>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex w-full">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/clientes' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] font-bold tracking-wider transition-all border-b-2 ${
                  isActive
                    ? 'border-[#1a8cff] text-[#1a8cff]'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <span className="text-sm">{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
