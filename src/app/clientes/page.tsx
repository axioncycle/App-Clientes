'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Customer, CustomerSKU, FollowUp, DashboardStats } from '@/lib/types'
import StatsCard from '@/components/StatsCard'
import CustomerCard from '@/components/CustomerCard'
import { format, parseISO, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type CustomerWithSKUs = Customer & { customer_skus: CustomerSKU[]; follow_ups: FollowUp[] }

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    interested: 0,
    purchased: 0,
    servicesToday: 0,
  })
  const [recentCustomers, setRecentCustomers] = useState<CustomerWithSKUs[]>([])
  const [followUpAlerts, setFollowUpAlerts] = useState<CustomerWithSKUs[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const { data: customers, error: err } = await supabase
          .from('customers')
          .select('*, customer_skus(*), follow_ups(*)')
          .order('created_at', { ascending: false })

        if (err) throw err

        const all = (customers ?? []) as CustomerWithSKUs[]
        const today = format(new Date(), 'yyyy-MM-dd')

        setStats({
          totalCustomers: all.length,
          interested: all.filter((c) => c.status === 'interested').length,
          purchased: all.filter((c) => c.status === 'purchased').length,
          servicesToday: all.filter((c) => c.service_date === today).length,
        })

        setRecentCustomers(all.slice(0, 5))

        const alerts = all.filter((c) => {
          if (c.follow_ups && c.follow_ups.length > 0) {
            const lastFollowUp = c.follow_ups.sort(
              (a, b) => new Date(b.contact_date).getTime() - new Date(a.contact_date).getTime()
            )[0]
            const days = differenceInDays(new Date(), parseISO(lastFollowUp.contact_date))
            return days >= 30
          }
          const daysSinceCreated = differenceInDays(new Date(), parseISO(c.created_at))
          return daysSinceCreated >= 30
        })

        setFollowUpAlerts(alerts.slice(0, 5))
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-10 h-10 text-blue-500 spinner" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-slate-400">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card border-red-700/50 bg-red-900/20 text-center py-10">
        <p className="text-red-400 font-medium">Erro ao carregar dados</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
        <p className="text-slate-500 text-sm mt-3">Verifique as variáveis de ambiente do Supabase.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <Link href="/clientes/customers/new" className="btn-accent flex items-center gap-2 self-start sm:self-auto">
          <span className="text-lg font-light">+</span> Novo Cliente
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total de Clientes" value={stats.totalCustomers} icon="👥" color="blue" />
        <StatsCard title="Interessados" value={stats.interested} icon="🔍" color="amber" />
        <StatsCard title="Compraram" value={stats.purchased} icon="✅" color="green" />
        <StatsCard title="Atendimentos Hoje" value={stats.servicesToday} icon="📅" color="purple" />
      </div>

      {stats.totalCustomers > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text2)' }}>Taxa de Conversão</span>
            <span className="text-lg font-black" style={{ color: 'var(--blue)' }}>
              {((stats.purchased / stats.totalCustomers) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ backgroundColor: 'var(--bg3)' }}>
            <div
              className="h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${(stats.purchased / stats.totalCustomers) * 100}%`, backgroundColor: 'var(--blue)' }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--text3)' }}>
            <span>{stats.purchased} compraram</span>
            <span>{stats.interested} em aberto</span>
          </div>
        </div>
      )}

      {followUpAlerts.length > 0 && (
        <div className="card border-amber-700/50 bg-amber-900/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-amber-300 flex items-center gap-2">
              <span>⚠️</span> Clientes sem contato há 30+ dias
            </h2>
            <Link href="/clientes/follow-ups" className="text-amber-400 hover:text-amber-300 text-sm underline">
              Ver todos
            </Link>
          </div>
          <div className="space-y-2">
            {followUpAlerts.map((c) => {
              const lastContact =
                c.follow_ups && c.follow_ups.length > 0
                  ? c.follow_ups.sort(
                      (a, b) => new Date(b.contact_date).getTime() - new Date(a.contact_date).getTime()
                    )[0].contact_date
                  : null
              const days = lastContact
                ? differenceInDays(new Date(), parseISO(lastContact))
                : differenceInDays(new Date(), parseISO(c.created_at))
              return (
                <Link
                  key={c.id}
                  href={`/clientes/customers/${c.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-amber-900/20 hover:bg-amber-900/30 transition-colors"
                >
                  <div>
                    <p className="font-medium text-white text-sm">{c.name}</p>
                    <p className="text-slate-400 text-xs">{c.phone ?? c.email ?? 'Sem contato'}</p>
                  </div>
                  <span className="text-amber-400 text-xs font-semibold bg-amber-900/40 px-2 py-1 rounded-full">
                    {days}d sem contato
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Clientes Recentes</h2>
          <Link href="/clientes/customers" className="text-blue-400 hover:text-blue-300 text-sm underline">
            Ver todos
          </Link>
        </div>
        {recentCustomers.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-5xl mb-3">🚲</p>
            <p className="text-slate-300 font-medium">Nenhum cliente cadastrado ainda</p>
            <p className="text-slate-500 text-sm mt-1">Comece adicionando seu primeiro cliente</p>
            <Link href="/clientes/customers/new" className="btn-accent inline-flex items-center gap-2 mt-4">
              <span>+</span> Novo Cliente
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentCustomers.map((c) => (
              <CustomerCard key={c.id} customer={c} />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/clientes/importar" className="card hover:border-[#1a8cff] transition-colors flex items-center gap-4 group">
          <span className="text-3xl">📥</span>
          <div>
            <p className="font-semibold group-hover:text-[#1a8cff] transition-colors" style={{ color: 'var(--text)' }}>Importar</p>
            <p className="text-sm" style={{ color: 'var(--text2)' }}>Importar da agenda</p>
          </div>
        </Link>
        <Link href="/clientes/exportar" className="card hover:border-[#1a8cff] transition-colors flex items-center gap-4 group">
          <span className="text-3xl">📤</span>
          <div>
            <p className="font-semibold group-hover:text-[#1a8cff] transition-colors" style={{ color: 'var(--text)' }}>Exportar</p>
            <p className="text-sm" style={{ color: 'var(--text2)' }}>Excel, CSV ou PDF</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
