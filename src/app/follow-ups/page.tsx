'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Customer, FollowUp } from '@/lib/types'
import { format, parseISO, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type CustomerWithFollowUps = Customer & { follow_ups: FollowUp[] }

interface Alert {
  customer: CustomerWithFollowUps
  daysSince: number
  lastContact: string | null
}

export default function FollowUpsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [noteMap, setNoteMap] = useState<Record<string, string>>({})
  const [successIds, setSuccessIds] = useState<Set<string>>(new Set())
  const [threshold, setThreshold] = useState(30)

  const fetchData = async () => {
    try {
      const { data } = await supabase
        .from('customers')
        .select('*, follow_ups(*)')
        .order('created_at', { ascending: false })

      const all = (data ?? []) as CustomerWithFollowUps[]

      const result: Alert[] = all
        .map((c) => {
          const sortedFU = [...(c.follow_ups ?? [])].sort(
            (a, b) => new Date(b.contact_date).getTime() - new Date(a.contact_date).getTime()
          )
          const lastContact = sortedFU[0]?.contact_date ?? null
          const daysSince = lastContact
            ? differenceInDays(new Date(), parseISO(lastContact))
            : differenceInDays(new Date(), parseISO(c.created_at))
          return { customer: c, daysSince, lastContact }
        })
        .filter((a) => a.daysSince >= threshold)
        .sort((a, b) => b.daysSince - a.daysSince)

      setAlerts(result)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [threshold])

  const handleRegisterContact = async (customerId: string) => {
    setSavingId(customerId)
    try {
      await supabase.from('follow_ups').insert({
        customer_id: customerId,
        contact_date: format(new Date(), 'yyyy-MM-dd'),
        notes: noteMap[customerId]?.trim() || null,
      })
      setNoteMap((prev) => ({ ...prev, [customerId]: '' }))
      setSuccessIds((prev) => new Set([...prev, customerId]))
      setTimeout(() => {
        setSuccessIds((prev) => {
          const next = new Set(prev)
          next.delete(customerId)
          return next
        })
        fetchData()
      }, 2000)
    } finally {
      setSavingId(null)
    }
  }

  const urgencyColor = (days: number) => {
    if (days >= 90) return { bg: 'bg-red-900/20', border: 'border-red-700/50', badge: 'bg-red-900/40 text-red-400', dot: 'bg-red-500' }
    if (days >= 60) return { bg: 'bg-orange-900/20', border: 'border-orange-700/50', badge: 'bg-orange-900/40 text-orange-400', dot: 'bg-orange-500' }
    return { bg: 'bg-amber-900/10', border: 'border-amber-700/30', badge: 'bg-amber-900/30 text-amber-400', dot: 'bg-amber-500' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Follow-ups</h1>
          <p className="text-slate-400 text-sm mt-1">
            Clientes que precisam de contato
          </p>
        </div>
        <Link href="/customers/new" className="btn-accent flex items-center gap-2 self-start">
          <span>+</span> Novo Cliente
        </Link>
      </div>

      {/* Threshold selector */}
      <div className="card flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-2xl">⏰</span>
          <div>
            <p className="text-white font-medium text-sm">Período sem contato</p>
            <p className="text-slate-400 text-xs">Mostrar clientes sem contato há mais de:</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[15, 30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setThreshold(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                threshold === d
                  ? 'bg-blue-800 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '30+ dias', count: alerts.filter((a) => a.daysSince >= 30 && a.daysSince < 60).length, color: 'text-amber-400' },
            { label: '60+ dias', count: alerts.filter((a) => a.daysSince >= 60 && a.daysSince < 90).length, color: 'text-orange-400' },
            { label: '90+ dias', count: alerts.filter((a) => a.daysSince >= 90).length, color: 'text-red-400' },
          ].map((s) => (
            <div key={s.label} className="card text-center py-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="flex flex-col items-center gap-3">
            <svg className="w-10 h-10 text-blue-500 spinner" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-slate-400">Carregando...</p>
          </div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-5xl mb-3">🎉</p>
          <p className="text-slate-300 font-medium">Todos os clientes estão em dia!</p>
          <p className="text-slate-500 text-sm mt-1">
            Nenhum cliente sem contato há {threshold}+ dias
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-slate-400 text-sm">
            {alerts.length} {alerts.length === 1 ? 'cliente' : 'clientes'} sem contato há {threshold}+ dias
          </p>

          {alerts.map(({ customer: c, daysSince, lastContact }) => {
            const colors = urgencyColor(daysSince)
            const isSuccess = successIds.has(c.id)
            const isSaving = savingId === c.id

            return (
              <div
                key={c.id}
                className={`${colors.bg} border ${colors.border} rounded-xl p-4 transition-all`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full ${colors.dot} flex-shrink-0 mt-1.5`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/customers/${c.id}`}
                          className="font-semibold text-white hover:text-blue-300 transition-colors"
                        >
                          {c.name}
                        </Link>
                        <span className={c.status === 'purchased' ? 'badge-purchased' : 'badge-interested'}>
                          {c.status === 'purchased' ? 'Comprou' : 'Interessado'}
                        </span>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {c.phone && (
                          <p className="text-slate-400 text-xs flex items-center gap-1.5">
                            <span>📱</span>
                            <a href={`tel:${c.phone}`} className="hover:text-white transition-colors">
                              {c.phone}
                            </a>
                          </p>
                        )}
                        {c.email && (
                          <p className="text-slate-400 text-xs flex items-center gap-1.5">
                            <span>✉️</span>
                            <a href={`mailto:${c.email}`} className="hover:text-white transition-colors truncate">
                              {c.email}
                            </a>
                          </p>
                        )}
                        <p className="text-slate-500 text-xs mt-1">
                          {lastContact
                            ? `Último contato: ${format(parseISO(lastContact), "d 'de' MMM 'de' yyyy", { locale: ptBR })}`
                            : 'Nunca foi contatado'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${colors.badge}`}>
                    {daysSince}d
                  </span>
                </div>

                {/* Quick register */}
                {isSuccess ? (
                  <div className="mt-3 bg-green-900/20 border border-green-700/50 rounded-lg p-2.5 text-green-300 text-sm flex items-center gap-2">
                    <span>✅</span> Contato registrado!
                  </div>
                ) : (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={noteMap[c.id] ?? ''}
                      onChange={(e) => setNoteMap((prev) => ({ ...prev, [c.id]: e.target.value }))}
                      placeholder="Nota (opcional)"
                      className="input text-xs flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && !isSaving && handleRegisterContact(c.id)}
                    />
                    <button
                      onClick={() => handleRegisterContact(c.id)}
                      disabled={isSaving}
                      className="btn-accent text-xs px-3 whitespace-nowrap flex-shrink-0 flex items-center gap-1.5"
                    >
                      {isSaving ? (
                        <svg className="w-3 h-3 spinner" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <span>📞</span>
                      )}
                      Registrar Contato
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
