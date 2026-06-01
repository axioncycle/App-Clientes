'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function FloatingQuickAdd() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<'interested' | 'purchased'>('interested')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setName(''); setPhone(''); setStatus('interested'); setError(null) }

  const close = () => { setOpen(false); reset() }

  const handleSave = async () => {
    if (!name.trim()) { setError('Nome obrigatório'); return }
    setSaving(true); setError(null)
    try {
      const { data, error: err } = await supabase
        .from('customers')
        .insert({ name: name.trim(), phone: phone.trim() || null, status, updated_at: new Date().toISOString() })
        .select('id')
        .single()
      if (err) throw err
      close()
      router.push(`/clientes/customers/${data.id}`)
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px',
          width: '56px', height: '56px', borderRadius: '50%',
          background: '#1a8cff', border: 'none',
          boxShadow: '0 4px 20px rgba(26,140,255,0.5)',
          color: '#fff', fontSize: '28px', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 1000,
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        title="Novo cliente rápido"
      >
        +
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          onClick={close}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            zIndex: 1001, padding: '0',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#111', borderRadius: '20px 20px 0 0',
              padding: '24px', width: '100%', maxWidth: '480px',
              borderTop: '1px solid #2a2a2a',
            }}
          >
            {/* Handle */}
            <div style={{ width: '40px', height: '4px', background: '#333', borderRadius: '2px', margin: '0 auto 20px' }} />

            <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '18px', margin: '0 0 4px' }}>Novo Cliente</h2>
            <p style={{ color: '#666', fontSize: '12px', margin: '0 0 20px' }}>Cadastro rápido — edite os demais dados depois</p>

            {error && (
              <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '12px', background: '#450a0a', padding: '8px 12px', borderRadius: '8px' }}>
                {error}
              </p>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: '#aaa', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Nome *</label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                placeholder="Nome do cliente"
                style={{
                  width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a',
                  borderRadius: '10px', padding: '12px 14px', color: '#fff',
                  fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ color: '#aaa', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Telefone</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                placeholder="(11) 99999-9999"
                style={{
                  width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a',
                  borderRadius: '10px', padding: '12px 14px', color: '#fff',
                  fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: '#aaa', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Status</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {([['interested', '🔍', 'Interessado'], ['purchased', '✅', 'Comprou']] as const).map(([val, icon, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setStatus(val)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '10px', border: '2px solid',
                      borderColor: status === val ? (val === 'purchased' ? '#10b981' : '#f59e0b') : '#2a2a2a',
                      background: status === val ? (val === 'purchased' ? '#064e3b' : '#451a03') : '#1a1a1a',
                      color: status === val ? (val === 'purchased' ? '#34d399' : '#fbbf24') : '#666',
                      fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                    }}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                style={{
                  flex: 1, background: saving || !name.trim() ? '#1a3a5c' : '#1a8cff',
                  color: '#fff', border: 'none', borderRadius: '12px',
                  padding: '14px', fontWeight: 800, fontSize: '15px', cursor: saving ? 'default' : 'pointer',
                }}
              >
                {saving ? 'Salvando...' : 'Cadastrar'}
              </button>
              <button
                onClick={close}
                style={{
                  padding: '14px 20px', background: '#1a1a1a', border: '1px solid #2a2a2a',
                  borderRadius: '12px', color: '#aaa', fontWeight: 700, cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
