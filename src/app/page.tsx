'use client'
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', width: '100%', maxWidth: 520 }}>
        <button
          onClick={() => router.push('/financeiro')}
          className="card"
          style={{ padding: '2.5rem 1.5rem', cursor: 'pointer', border: '2px solid var(--blue)', textAlign: 'center', borderRadius: 20, background: 'var(--bg2)', transition: 'all 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(26,140,255,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg2)')}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>💰</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>Financeiro</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>Vendas, estoque, DRE</div>
        </button>
        <button
          onClick={() => router.push('/clientes')}
          className="card"
          style={{ padding: '2.5rem 1.5rem', cursor: 'pointer', border: '2px solid var(--blue)', textAlign: 'center', borderRadius: 20, background: 'var(--bg2)', transition: 'all 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(26,140,255,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg2)')}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>Clientes</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>CRM, funil, follow-ups</div>
        </button>
        <button
          onClick={() => router.push('/pessoal')}
          className="card"
          style={{ padding: '2.5rem 1.5rem', cursor: 'pointer', border: '2px solid #a855f7', textAlign: 'center', borderRadius: 20, background: 'var(--bg2)', transition: 'all 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(168,85,247,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg2)')}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>Pessoal</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>Patrimônio, cofrinhos, gastos</div>
        </button>
      </div>
      <button
        onClick={handleLogout}
        style={{ marginTop: '3rem', fontSize: 13, color: 'var(--text2)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
      >
        Sair
      </button>
    </div>
  )
}
