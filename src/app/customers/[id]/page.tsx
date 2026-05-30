'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Customer, CustomerSKU, FollowUp } from '@/lib/types'
import CustomerForm from '@/components/CustomerForm'
import { format, parseISO, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type FullCustomer = Customer & { customer_skus: CustomerSKU[]; follow_ups: FollowUp[] }

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [customer, setCustomer] = useState<FullCustomer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'detail' | 'edit'>('detail')
  const [followUpNote, setFollowUpNote] = useState('')
  const [savingFollowUp, setSavingFollowUp] = useState(false)
  const [followUpSuccess, setFollowUpSuccess] = useState(false)

  const fetchCustomer = async () => {
    try {
      const { data, error: err } = await supabase
        .from('customers')
        .select('*, customer_skus(*), follow_ups(*)')
        .eq('id', id)
        .single()

      if (err) throw err
      setCustomer(data as FullCustomer)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Cliente não encontrado')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomer()
  }, [id])

  const handleAddFollowUp = async () => {
    if (!customer) return
    setSavingFollowUp(true)
    try {
      const { error: err } = await supabase.from('follow_ups').insert({
        customer_id: customer.id,
        contact_date: format(new Date(), 'yyyy-MM-dd'),
        notes: followUpNote.trim() || null,
      })
      if (err) throw err
      setFollowUpNote('')
      setFollowUpSuccess(true)
      setTimeout(() => setFollowUpSuccess(false), 3000)
      fetchCustomer()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao registrar follow-up')
    } finally {
      setSavingFollowUp(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-10 h-10 text-blue-500 spinner" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-slate-400">Carregando cliente...</p>
        </div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="card border-red-700/50 bg-red-900/20 text-center py-10">
        <p className="text-red-400 font-medium">Erro</p>
        <p className="text-red-500 text-sm mt-1">{error ?? 'Cliente não encontrado'}</p>
        <Link href="/customers" className="btn-secondary inline-flex mt-4">
          Voltar para lista
        </Link>
      </div>
    )
  }

  const interestSkus = customer.customer_skus.filter((s) => s.type === 'interest')
  const purchasedSkus = customer.customer_skus.filter((s) => s.type === 'purchased')
  const sortedFollowUps = [...(customer.follow_ups ?? [])].sort(
    (a, b) => new Date(b.contact_date).getTime() - new Date(a.contact_date).getTime()
  )
  const lastContact = sortedFollowUps[0]?.contact_date ?? null
  const daysSinceContact = lastContact
    ? differenceInDays(new Date(), parseISO(lastContact))
    : null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/" className="hover:text-white transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href="/customers" className="hover:text-white transition-colors">Clientes</Link>
        <span>/</span>
        <span className="text-white truncate max-w-32">{customer.name}</span>
      </nav>

      {/* View/Edit toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white truncate">{customer.name}</h1>
          <span className={customer.status === 'purchased' ? 'badge-purchased' : 'badge-interested'}>
            {customer.status === 'purchased' ? 'Comprou' : 'Interessado'}
          </span>
        </div>
        <button
          onClick={() => setView(view === 'detail' ? 'edit' : 'detail')}
          className={view === 'edit' ? 'btn-secondary text-sm' : 'btn-primary text-sm flex items-center gap-2'}
        >
          {view === 'edit' ? 'Cancelar edição' : <><span>✏️</span> Editar</>}
        </button>
      </div>

      {view === 'edit' ? (
        <CustomerForm customer={customer} mode="edit" />
      ) : (
        <div className="space-y-5">
          {/* Contact info */}
          <div className="card space-y-3">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Contato</h2>
            <div className="space-y-2">
              {customer.phone && (
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 w-5">📱</span>
                  <a href={`tel:${customer.phone}`} className="text-white hover:text-blue-300 transition-colors">
                    {customer.phone}
                  </a>
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 w-5">✉️</span>
                  <a href={`mailto:${customer.email}`} className="text-white hover:text-blue-300 transition-colors truncate">
                    {customer.email}
                  </a>
                </div>
              )}
              {!customer.phone && !customer.email && (
                <p className="text-slate-500 text-sm">Nenhum contato registrado</p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="card space-y-3">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Datas</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Atendimento</p>
                <p className="text-white text-sm">
                  {customer.service_date
                    ? format(parseISO(customer.service_date), "d 'de' MMM 'de' yyyy", { locale: ptBR })
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Compra</p>
                <p className="text-white text-sm">
                  {customer.purchase_date
                    ? format(parseISO(customer.purchase_date), "d 'de' MMM 'de' yyyy", { locale: ptBR })
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Cadastrado em</p>
                <p className="text-white text-sm">
                  {format(parseISO(customer.created_at), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
              {lastContact && (
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Último contato</p>
                  <p className="text-white text-sm">
                    {format(parseISO(lastContact), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                    <span className={`ml-1.5 text-xs ${(daysSinceContact ?? 0) >= 30 ? 'text-amber-400' : 'text-slate-500'}`}>
                      ({daysSinceContact}d atrás)
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* SKUs */}
          {customer.customer_skus.length > 0 && (
            <div className="card space-y-4">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">SKUs / Produtos</h2>

              {interestSkus.length > 0 && (
                <div>
                  <p className="text-xs text-amber-400 font-medium mb-2">Interesse</p>
                  <div className="space-y-2">
                    {interestSkus.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-amber-900/10 border border-amber-900/30 rounded-lg">
                        <div>
                          <p className="text-white font-mono text-sm font-medium">{s.sku}</p>
                          {s.description && <p className="text-slate-400 text-xs mt-0.5">{s.description}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-slate-300 text-sm">Qtd: {s.quantity}</p>
                          {s.unit_price && (
                            <p className="text-amber-400 text-xs">
                              R$ {Number(s.unit_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {purchasedSkus.length > 0 && (
                <div>
                  <p className="text-xs text-green-400 font-medium mb-2">Comprado</p>
                  <div className="space-y-2">
                    {purchasedSkus.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-green-900/10 border border-green-900/30 rounded-lg">
                        <div>
                          <p className="text-white font-mono text-sm font-medium">{s.sku}</p>
                          {s.description && <p className="text-slate-400 text-xs mt-0.5">{s.description}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-slate-300 text-sm">Qtd: {s.quantity}</p>
                          {s.unit_price && (
                            <p className="text-green-400 text-xs">
                              R$ {Number(s.unit_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {customer.notes && (
            <div className="card space-y-2">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Observações</h2>
              <p className="text-slate-300 text-sm whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}

          {/* Follow-up */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Follow-ups</h2>
              {daysSinceContact !== null && daysSinceContact >= 30 && (
                <span className="text-xs bg-amber-900/30 text-amber-400 border border-amber-700/50 px-2 py-1 rounded-full">
                  ⚠️ {daysSinceContact}d sem contato
                </span>
              )}
            </div>

            {/* Add follow-up */}
            {followUpSuccess && (
              <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3 text-green-300 text-sm flex items-center gap-2">
                <span>✅</span> Contato registrado com sucesso!
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={followUpNote}
                onChange={(e) => setFollowUpNote(e.target.value)}
                placeholder="Nota do contato (opcional)"
                className="input text-sm flex-1"
                onKeyDown={(e) => e.key === 'Enter' && !savingFollowUp && handleAddFollowUp()}
              />
              <button
                onClick={handleAddFollowUp}
                disabled={savingFollowUp}
                className="btn-accent text-sm px-4 whitespace-nowrap flex-shrink-0"
              >
                {savingFollowUp ? '...' : '+ Registrar'}
              </button>
            </div>

            {/* History */}
            {sortedFollowUps.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {sortedFollowUps.map((fu) => (
                  <div key={fu.id} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"></div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-400">
                        {format(parseISO(fu.contact_date), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                      </p>
                      {fu.notes && <p className="text-slate-300 text-sm mt-0.5">{fu.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">Nenhum follow-up registrado</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
