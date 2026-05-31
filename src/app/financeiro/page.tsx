'use client'
import Link from 'next/link'

export default function FinanceiroPage() {
  return (
    <>
      <style>{`
        body { margin: 0; overflow: hidden; }
        #fin-iframe { position: fixed; top: 0; left: 0; width: 100%; height: 100%; border: none; z-index: 0; }
        #ax-back {
          position: fixed;
          top: 10px;
          left: 10px;
          z-index: 99999;
          background: #1a8cff;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 7px 13px;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          letter-spacing: 1px;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 5px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.5);
          font-family: system-ui, sans-serif;
        }
        #ax-back:hover { background: #3399ff; }
      `}</style>
      <Link id="ax-back" href="/">← MÓDULOS</Link>
      <iframe
        id="fin-iframe"
        src="/financeiro-app"
        title="Financeiro"
        allow="clipboard-read; clipboard-write"
      />
    </>
  )
}
