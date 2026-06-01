'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Customer, CustomerSKU, PipelineStage } from '@/lib/types'

type CustomerWithSKUs = Customer & { customer_skus: CustomerSKU[] }

interface Column {
  id: PipelineStage
  label: string
  icon: string
  color: string
  borderColor: string
  badgeColor: string
}

const COLUMNS: Column[] = [
  { id: 'contato_inicial', label: 'Contato Inicial', icon: '☎️', color: 'bg-gray-800/60', borderColor: 'border-gray-600', badgeColor: 'bg-gray-700 text-gray-300' },
  { id: 'negociando', label: 'Negociando', icon: '🚴‍♂️', color: 'bg-amber-900/20', borderColor: 'border-amber-700/50', badgeColor: 'bg-amber-900/50 text-amber-300' },
  { id: 'separando_envio', label: 'Separando Envio', icon: '🎁', color: 'bg-blue-900/20', borderColor: 'border-blue-700/50', badgeColor: 'bg-blue-900/50 text-blue-300' },
  { id: 'enviado', label: 'ENVIADO', icon: '🚀', color: 'bg-green-900/20', borderColor: 'border-green-700/50', badgeColor: 'bg-green-900/50 text-green-300' },
]

function formatWhatsApp(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return null
  const withoutZero = digits.startsWith('0') ? digits.slice(1) : digits
  return withoutZero.startsWith('55') ? withoutZero : '55' + withoutZero
}

export default function FunilPage() {
  const [customers, setCustomers] = useState<CustomerWithSKUs[]>([])
  const [offFunil, setOffFunil] = useState<CustomerWithSKUs[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<PipelineStage | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [search, setSearch] = useState('')
  const dragCustomer = useRef<CustomerWithSKUs | null>(null)

  const load = async () => {
    try {
      const { data, error: err } = await supabase
        .from('customers')
        .select('*, customer_skus(*)')
        .order('created_at', { ascending: false })
      if (err) throw err
      const rows = (data ?? []) as CustomerWithSKUs[]
      setCustomers(rows.filter((c) => c.pipeline_stage))
      setOffFunil(rows.filter((c) => !c.pipeline_stage))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar clientes')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDragStart = (customer: CustomerWithSKUs) => { dragCustomer.current = customer; setDraggingId(customer.id) }
  const handleDragEnd = () => { setDraggingId(null); setDragOverCol(null); dragCustomer.current = null }

  const handleDrop = async (stage: PipelineStage) => {
    const customer = dragCustomer.current
    if (!customer || customer.pipeline_stage === stage) { setDragOverCol(null); return }
    setCustomers((prev) => prev.map((c) => (c.id === customer.id ? { ...c, pipeline_stage: stage } : c)))
    setDragOverCol(null)
    const { error: err } = await supabase.from('customers').update({ pipeline_stage: stage, updated_at: new Date().toISOString() }).eq('id', customer.id)
    if (err) setCustomers((prev) => prev.map((c) => (c.id === customer.id ? { ...c, pipeline_stage: customer.pipeline_stage } : c)))
  }

  const removeFromFunil = async (customer: CustomerWithSKUs) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customer.id))
    setOffFunil((prev) => [{ ...customer, pipeline_stage: null as unknown as PipelineStage }, ...prev])
    await supabase.from('customers').update({ pipeline_stage: null, updated_at: new Date().toISOString() }).eq('id', customer.id)
  }

  const addToFunil = async (customer: CustomerWithSKUs) => {
    const stage: PipelineStage = 'contato_inicial'
    setOffFunil((prev) => prev.filter((c) => c.id !== customer.id))
    setCustomers((prev) => [{ ...customer, pipeline_stage: stage }, ...prev])
    await supabase.from('customers').update({ pipeline_stage: stage, updated_at: new Date().toISOString() }).eq('id', customer.id)
  }

  const filtered = offFunil.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? '').includes(search)
  )

  if (loading) return (<div className="flex items-center justify-center min-h-64"><svg className="w-10 h-10 text-blue-500 spinner" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>)
  if (error) return (<div className="card border-red-700/50 bg-red-900/20 text-center py-10"><p className="text-red-400">{error}</p></div>)

  const byStage = (stage: PipelineStage) => customers.filter((c) => c.pipeline_stage === stage)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><span>🎯</span> Funil de Vendas</h1>
          <p className="text-slate-400 text-sm mt-1">Arraste os clientes entre as colunas para atualizar o estágio</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ background: '#1a8cff', color: '#fff', border: 'none', borderRadius: '10px', padding: '8px 16px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          + Adicionar
        </button>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {COLUMNS.map((col) => {
            const colCustomers = byStage(col.id)
            const isOver = dragOverCol === col.id
            return (
              <div key={col.id} className={`flex flex-col w-72 rounded-2xl border ${col.borderColor} ${col.color} transition-all ${isOver ? 'ring-2 ring-[#1a8cff] scale-[1.01]' : ''}`} onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.id) }} onDragLeave={() => setDragOverCol(null)} onDrop={() => handleDrop(col.id)}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <div className="flex items-center gap-2"><span className="text-lg">{col.icon}</span><span className="font-semibold text-white text-sm">{col.label}</span></div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badgeColor}`}>{colCustomers.length}</span>
                </div>
                <div className="flex flex-col gap-2 p-3 min-h-32">
                  {colCustomers.map((customer) => {
                    const waNumber = customer.phone ? formatWhatsApp(customer.phone) : null
                    const skuCount = customer.customer_skus?.length ?? 0
                    const isDragging = draggingId === customer.id
                    return (
                      <div key={customer.id} draggable onDragStart={() => handleDragStart(customer)} onDragEnd={handleDragEnd} className={`bg-[#111111] border border-[#2a2a2a] rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all select-none ${isDragging ? 'opacity-40 scale-95' : 'hover:border-[#1a8cff]/50'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <Link href={`/clientes/customers/${customer.id}`} className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()} draggable={false}>
                            <p className="font-semibold text-white text-sm truncate hover:text-[#1a8cff] transition-colors">{customer.name}</p>
                            {customer.phone && <p className="text-slate-400 text-xs mt-0.5 truncate">{customer.phone}</p>}
                            {skuCount > 0 && <p className="text-xs text-slate-500 mt-1">{skuCount} SKU{skuCount !== 1 ? 's' : ''}</p>}
                          </Link>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {waNumber && (<a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} draggable={false} className="w-7 h-7 rounded-lg bg-green-900/40 hover:bg-green-800/60 text-green-400 flex items-center justify-center transition-colors" title="WhatsApp"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>)}
                            <button
                              onClick={(e) => { e.stopPropagation(); removeFromFunil(customer) }}
                              draggable={false}
                              title="Remover do funil"
                              style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'transparent', border: '1px solid #3a3a3a', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#3a0000'; e.currentTarget.style.color = '#f87171' }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#666' }}
                            >×</button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {colCustomers.length === 0 && (<div className="flex items-center justify-center h-16 rounded-xl border border-dashed border-white/10"><p className="text-slate-600 text-xs">Arraste um cliente aqui</p></div>)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal adicionar ao funil */}
      {showAddModal && (
        <div onClick={() => { setShowAddModal(false); setSearch('') }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1001 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111', borderRadius: '20px 20px 0 0', padding: '20px', width: '100%', maxWidth: '480px', maxHeight: '70vh', display: 'flex', flexDirection: 'column', borderTop: '1px solid #2a2a2a' }}>
            <div style={{ width: '40px', height: '4px', background: '#333', borderRadius: '2px', margin: '0 auto 16px' }} />
            <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '17px', margin: '0 0 12px' }}>Adicionar ao Funil</h2>
            <input
              autoFocus
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '14px', outline: 'none', marginBottom: '12px' }}
            />
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filtered.length === 0 ? (
                <p style={{ color: '#555', textAlign: 'center', padding: '24px 0', fontSize: '14px' }}>
                  {offFunil.length === 0 ? 'Todos os clientes já estão no funil' : 'Nenhum resultado'}
                </p>
              ) : (
                filtered.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => addToFunil(c)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '10px', cursor: 'pointer', marginBottom: '6px', background: '#1a1a1a', border: '1px solid #2a2a2a' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#1a8cff')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
                  >
                    <div>
                      <p style={{ color: '#fff', fontWeight: 600, fontSize: '14px', margin: 0 }}>{c.name}</p>
                      {c.phone && <p style={{ color: '#666', fontSize: '12px', margin: '2px 0 0' }}>{c.phone}</p>}
                    </div>
                    <span style={{ color: '#1a8cff', fontWeight: 700, fontSize: '20px' }}>+</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
