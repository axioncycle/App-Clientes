'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navLinks = [
  { href: '/',          label: 'DASHBOARD', icon: '📊' },
  { href: '/customers', label: 'CLIENTES',  icon: '👥' },
  { href: '/importar',  label: 'IMPORTAR',  icon: '📥' },
  { href: '/follow-ups',label: 'FOLLOW-UP', icon: '🔔' },
  { href: '/calendar',  label: 'AGENDA',    icon: '📅' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-[#111111] border-b border-[#1f1f1f] sticky top-0 z-50">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo + title */}
        <Link href="/" className="flex items-center gap-3">
          {/* Logo placeholder — replace public/logo.png to update */}
          <div className="w-11 h-11 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center overflow-hidden flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Axion Cycle"
              className="w-full h-full object-contain"
              onError={(e) => {
                const t = e.currentTarget
                t.style.display = 'none'
                t.parentElement!.innerHTML = '<span style="font-size:22px">🚲</span>'
              }}
            />
          </div>
          <div>
            <p className="font-black text-base text-[#1a8cff] tracking-widest leading-none uppercase">Axion Cycle</p>
            <p className="text-[10px] text-gray-400 tracking-widest uppercase leading-none mt-0.5">Gestão de Clientes</p>
          </div>
        </Link>

        {/* Right icons */}
        <div className="flex items-center gap-2">
          <Link
            href="/customers/new"
            className="w-9 h-9 rounded-xl bg-[#1a8cff] hover:bg-[#3399ff] flex items-center justify-center text-white font-bold text-xl transition-colors"
            title="Novo Cliente"
          >
            +
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-9 h-9 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-300"
          >
            {menuOpen
              ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
            }
          </button>
        </div>
      </div>

      {/* Tab bar — desktop always visible, mobile only when open */}
      <div className={`border-t border-[#1f1f1f] overflow-x-auto ${menuOpen ? 'block' : 'hidden md:block'}`}>
        <div className="flex min-w-max md:min-w-0">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex flex-col items-center gap-1 px-5 py-2.5 text-[10px] font-bold tracking-widest transition-all border-b-2 flex-1 md:flex-none ${
                  isActive
                    ? 'border-[#1a8cff] text-[#1a8cff]'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
