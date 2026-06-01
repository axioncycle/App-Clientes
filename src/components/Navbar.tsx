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
      {/* Header row — mesmo visual do módulo Financeiro */}
      <div style={{ height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
        {/* Logo + title */}
        <Link href="/clientes" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: '#1a1a1a', border: '1px solid #2a2a2a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png" alt="Axion Cycle"
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const p = e.currentTarget.parentElement
                if (p) p.innerHTML = '<span style="font-size:16px">👥</span>'
              }}
            />
          </div>
          <div>
            <p style={{ fontWeight: 900, fontSize: '13px', color: '#1a8cff', letterSpacing: '2px', textTransform: 'uppercase', lineHeight: 1, margin: 0 }}>Axion Cycle</p>
            <p style={{ fontSize: '9px', color: '#666', letterSpacing: '2px', textTransform: 'uppercase', lineHeight: 1, marginTop: '3px', marginBottom: 0 }}>Clientes</p>
          </div>
        </Link>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <Link
            href="/"
            style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '1px',
              color: '#fff', textDecoration: 'none',
              padding: '6px 14px', borderRadius: '8px',
              background: '#1a1a1a', border: '1px solid #444',
              whiteSpace: 'nowrap',
            }}
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
