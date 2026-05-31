'use client'
import Link from 'next/link'

export default function FinanceiroPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden', margin: 0 }}>
      <style>{`
        body { margin: 0 !important; overflow: hidden !important; }
        html { overflow: hidden; }
      `}</style>

      {/* Top bar */}
      <div style={{
        height: '48px',
        minHeight: '48px',
        background: '#050505',
        borderBottom: '1px solid #222',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 10,
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
                if (p) p.innerHTML = '<span style="font-size:16px">💰</span>'
              }}
            />
          </div>
          <div>
            <p style={{ fontWeight: 900, fontSize: '13px', color: '#1a8cff', letterSpacing: '2px', textTransform: 'uppercase', lineHeight: 1, margin: 0 }}>Axion Cycle</p>
            <p style={{ fontSize: '9px', color: '#666', letterSpacing: '2px', textTransform: 'uppercase', lineHeight: 1, marginTop: '3px', marginBottom: 0 }}>Financeiro</p>
          </div>
        </div>

        <Link
          href="/"
          style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '1px',
            color: '#aaa', textDecoration: 'none',
            padding: '5px 10px', borderRadius: '8px',
            border: '1px solid #333',
          }}
        >
          ← MÓDULOS
        </Link>
      </div>

      <iframe
        src="/financeiro-app"
        title="Financeiro"
        allow="clipboard-read; clipboard-write"
        style={{ flex: 1, border: 'none', width: '100%', display: 'block', minHeight: 0 }}
      />
    </div>
  )
}
