'use client'
import Link from 'next/link'

export default function PessoalPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#050505' }}>
      {/* Top bar */}
      <div style={{
        height: '48px',
        minHeight: '48px',
        flexShrink: 0,
        background: '#050505',
        borderBottom: '1px solid #222',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 9999,
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: '#1a1a1a', border: '1px solid #2a2a2a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png" alt=""
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const p = e.currentTarget.parentElement
                if (p) p.innerHTML = '<span style="font-size:16px">👤</span>'
              }}
            />
          </div>
          <div>
            <p style={{ fontWeight: 900, fontSize: '13px', color: '#a855f7', letterSpacing: '2px', textTransform: 'uppercase', lineHeight: 1, margin: 0 }}>Axion Cycle</p>
            <p style={{ fontSize: '9px', color: '#666', letterSpacing: '2px', textTransform: 'uppercase', lineHeight: 1, marginTop: '3px', marginBottom: 0 }}>Pessoal</p>
          </div>
        </div>

        <Link
          href="/"
          style={{
            fontSize: '11px', fontWeight: 700, letterSpacing: '1px',
            color: '#fff', textDecoration: 'none',
            padding: '6px 14px', borderRadius: '8px',
            background: '#1a1a1a',
            border: '1px solid #444',
            whiteSpace: 'nowrap',
          }}
        >
          ← MÓDULOS
        </Link>
      </div>

      <iframe
        src="/pessoal-app"
        title="Pessoal"
        allow="clipboard-read; clipboard-write"
        style={{ flex: 1, border: 'none', width: '100%', display: 'block', minHeight: 0, overflow: 'hidden' }}
      />
    </div>
  )
}
