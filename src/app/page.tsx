'use client'
import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase'

export default function ModuleSelector() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createSupabaseBrowser()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
      backgroundColor: '#08080c',
      backgroundImage: [
        'radial-gradient(1100px 620px at 12% 8%, rgba(201,162,39,0.13), transparent 60%)',
        'radial-gradient(900px 520px at 92% 88%, rgba(201,162,39,0.10), transparent 55%)',
        'linear-gradient(118deg, transparent 38%, rgba(212,175,55,0.07) 46%, transparent 51%)',
        'linear-gradient(118deg, transparent 60%, rgba(212,175,55,0.055) 66%, transparent 71%)',
        'linear-gradient(118deg, transparent 78%, rgba(212,175,55,0.045) 83%, transparent 88%)',
        'radial-gradient(1400px 900px at 50% 120%, rgba(0,0,0,0.55), transparent 60%)',
      ].join(', '),
      backgroundAttachment: 'fixed',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Axion Cycle"
          style={{ width: 80, height: 80, margin: '0 auto 1rem', borderRadius: 16, objectFit: 'contain', display: 'block' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--blue)', letterSpacing: 2 }}>AXION CYCLE</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6, letterSpacing: 1, textTransform: 'uppercase' }}>Escolha o módulo</div>
      </div>
      <div className="modules">
        {[
          { path: '/financeiro', icon: '💰', title: 'Financeiro', sub: 'Vendas, estoque, DRE', acc: '#1a8cff' },
          { path: '/clientes', icon: '👥', title: 'Clientes', sub: 'CRM, funil, follow-ups', acc: '#22c55e' },
          { path: '/pessoal', icon: '👤', title: 'Pessoal', sub: 'Patrimônio, cofrinhos, gastos', acc: '#a855f7' },
        ].map(m => (
          <button
            key={m.path}
            onClick={() => router.push(m.path)}
            className="mod-card"
            style={{ '--acc': m.acc } as CSSProperties}
          >
            <span className="mod-ico">{m.icon}</span>
            <span className="mod-txt">
              <span className="mod-title">{m.title}</span>
              <span className="mod-sub">{m.sub}</span>
            </span>
            <span className="mod-arrow" aria-hidden>→</span>
          </button>
        ))}
      </div>
      <style jsx>{`
        .modules { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 380px; }
        .mod-card {
          display: flex; align-items: center; gap: 14px; width: 100%; padding: 14px 16px;
          border-radius: 16px; cursor: pointer; text-align: left; color: inherit;
          background: linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018));
          border: 1px solid rgba(212,175,55,0.22);
          -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
          box-shadow: 0 6px 22px rgba(0,0,0,0.35);
          transition: transform .18s cubic-bezier(.2,.8,.2,1), border-color .18s, box-shadow .18s, background .18s;
          position: relative; overflow: hidden;
        }
        .mod-card::after {
          content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
          background: radial-gradient(120px 80px at 12% 0%, color-mix(in srgb, var(--acc) 22%, transparent), transparent 70%);
          opacity: 0; transition: opacity .18s;
        }
        .mod-card:hover { transform: translateY(-3px); border-color: var(--acc);
          box-shadow: 0 16px 42px rgba(0,0,0,0.5), 0 0 24px -8px var(--acc); }
        .mod-card:hover::after { opacity: 1; }
        .mod-card:active { transform: translateY(-1px) scale(.985); }
        .mod-ico {
          width: 46px; height: 46px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 24px;
          background: radial-gradient(circle at 30% 25%, rgba(212,175,55,0.20), rgba(255,255,255,0.03));
          border: 1px solid rgba(212,175,55,0.28);
          transition: transform .18s cubic-bezier(.2,.8,.2,1);
        }
        .mod-card:hover .mod-ico { transform: scale(1.08) rotate(-4deg); }
        .mod-txt { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .mod-title { font-size: 16px; font-weight: 800; color: #f4f1e8; letter-spacing: .3px; }
        .mod-sub { font-size: 11.5px; color: #9a9488; margin-top: 2px; }
        .mod-arrow { color: var(--acc); font-size: 18px; font-weight: 700; opacity: .45;
          transform: translateX(-5px); transition: transform .18s, opacity .18s; flex-shrink: 0; }
        .mod-card:hover .mod-arrow { opacity: 1; transform: translateX(0); }
      `}</style>
      <button
        onClick={handleLogout}
        style={{ marginTop: '3rem', fontSize: 13, color: 'var(--text2)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
      >
        Sair
      </button>
    </div>
  )
}
