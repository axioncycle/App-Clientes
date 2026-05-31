'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { searchSKU, SKUItem } from '@/lib/skuCatalog'

const today = () => format(new Date(), 'yyyy-MM-dd')

export default function QuickAddModal() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [sku, setSku] = useState('')
  const [skuResults, setSkuResults] = useState<SKUItem[]>([])
  const [skuOpen, setSkuOpen] = useState(false)
  const skuRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'interested' | 'purchased'>('interested')
  const [serviceDate, setServiceDate] = useState(today())

  useEffect(() => {
    if (open) {
      setName('')
      setPhone('')
      setSku('')
      setStatus('interested')
      setServiceDate(today())
      setError('')
      setSuccess(false)
    }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (skuRef.current && !skuRef.current.contains(e.target as Node)) setSkuOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSkuChange = (v: string) => {
    setSku(v)
    setSkuResults(searchSKU(v))
    setSkuOpen(!!v.trim())
  }

  const handleSave = async () => {
    if (!name.trim()) { setError('Nome é obrigatório'); return }
    setSaving(true)
    setError('')
    try {
      const { data: customer, error: err } = await supabase
        .from('customers')
        .insert({ name: name.trim(), phone: phone.trim() || null, status, service_date: serviceDate })
        .select()
        .single()
      if (err) throw new Error(`Supabase: ${err.message} (code: ${err.code})`)
      if (!customer) throw new Error('Cliente não retornado pelo banco')

      if (sku.trim() && customer) {
        await supabase.from('customer_skus').insert({
          customer_id: customer.id,
          sku: sku.trim(),
          type: status === 'purchased' ? 'purchased' : 'interest',
          quantity: 1,
        })
      }

      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        router.push(`/customers/${customer.id}`)
      }, 900)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : JSON.stringify(e)
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-2xl shadow-blue-900/50 flex items-center justify-center text-white text-2xl transition-all"
        title="Cadastro rápido"
        aria-label="Novo cliente rápido"
      >
        +
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          {/* Modal */}
          <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
              <h2 className="text-lg font-bold text-white">Cadastro Rápido</h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white text-xl leading-none">✕</button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-4">

              {/* Status */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setStatus('interested')}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    status === 'interested'
                      ? 'bg-amber-500 text-white shadow'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  Interessado
                </button>
                <button
                  onClick={() => setStatus('purchased')}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    status === 'purchased'
                      ? 'bg-green-600 text-white shadow'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  Comprou
                </button>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nome *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do cliente"
                  className="input w-full text-base"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Telefone / WhatsApp</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="input w-full text-base"
                />
              </div>

              {/* SKU */}
              <div ref={skuRef} className="relative">
                <label className="block text-xs text-gray-400 mb-1">SKU / Produto</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => handleSkuChange(e.target.value)}
                  onFocus={() => sku.trim() && setSkuOpen(true)}
                  placeholder="Digite para buscar produto..."
                  className="input w-full text-base"
                />
                {skuOpen && skuResults.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                    {skuResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => { setSku(item.name); setSkuOpen(false) }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#252525] text-left transition-colors"
                      >
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1a8cff]/20 text-[#1a8cff] flex-shrink-0">{item.category}</span>
                        <span className="text-sm text-white truncate">{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Data de atendimento */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Data de Atendimento</label>
                <input
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="input w-full text-base"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2">{error}</p>
              )}

              {success && (
                <p className="text-green-400 text-sm bg-green-900/20 border border-green-700/40 rounded-lg px-3 py-2 flex items-center gap-2">
                  <span>✅</span> Cliente salvo! Abrindo...
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 flex gap-3">
              <button onClick={() => setOpen(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || success}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : '✓'} Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
