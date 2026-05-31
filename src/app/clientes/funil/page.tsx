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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<PipelineStage | null>(null)
  const dragCustomer = useRef<CustomerWithSKUs | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const { data, error: err } = await supabase
          .from('customers')
          .select('*, customer_skus(*)')
          .order('created_at', { ascending: false })
        if (err) throw err
        const rows = (data ?? []) as CustomerWithSKUs[]

        // Assign contato_inicial to customers without a stage
        const missing = rows.filter((c) => !c.pipeline_stage).map((c) => c.id)
        if (missing.length > 0) {
          await supabase
            .from('customers')
            .update({ pipeline_stage: 'contato_inicial' as PipelineStage })
            .in('id', missing)
        }

        // Normalise locally
        const normalised = rows.map((c) =>
          c.pipeline_stage ? c : { ...c, pipeline_stage: 'contato_inicial' as PipelineStage }
        )
        setCustomers(normalised)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Erro ao carregar clientes')
      } finally { setLoading(false) }
    }
    load()
  }, [])

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

  if (loading) return (<div className="flex items-center justify-center min-h-64"><svg className="w-10 h-10 text-blue-500 spinner" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>)
  if (error) return (<div className="card border-red-700/50 bg-red-900/20 text-center py-10"><p className="text-red-400">{error}</p></div>)

  const byStage = (stage: PipelineStage) =>
    customers.filter((c) => (c.pipeline_stage || 'contato_inicial') === stage)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><span>🎯</span> Funil de Vendas</h1>
        <p className="text-slate-400 text-sm mt-1">Arraste os clientes entre as colunas para atualizar o estágio</p>
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
                          {waNumber && (<a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} draggable={false} className="flex-shrink-0 w-7 h-7 rounded-lg bg-green-900/40 hover:bg-green-800/60 text-green-400 flex items-center justify-center transition-colors" title="WhatsApp"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>)}
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
    </div>
  )
}
