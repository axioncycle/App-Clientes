'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Customer } from '@/lib/types'
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  isToday,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await supabase
          .from('customers')
          .select('id, name, phone, email, status, service_date, purchase_date, notes, created_at, updated_at')
          .not('service_date', 'is', null)
        setCustomers(data ?? [])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  // Days before month starts (Sunday = 0)
  const startPad = getDay(monthStart)

  const customersOnDay = (day: Date) =>
    customers.filter((c) => c.service_date && isSameDay(parseISO(c.service_date), day))

  const selectedCustomers = selectedDay ? customersOnDay(selectedDay) : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Agenda</h1>
          <p className="text-slate-400 text-sm mt-1">Atendimentos por data de serviço</p>
        </div>
        <button
          onClick={() => setShowImportModal(true)}
          className="btn-secondary flex items-center gap-2 self-start"
        >
          <span>📲</span> Importar da Agenda
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="flex flex-col items-center gap-3">
            <svg className="w-10 h-10 text-blue-500 spinner" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-slate-400">Carregando agenda...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar grid */}
          <div className="lg:col-span-2 card">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-lg font-semibold text-white capitalize">
                {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
              </h2>
              <button
                onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
                <div key={d} className="text-center text-xs text-slate-500 font-medium py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Padding */}
              {Array.from({ length: startPad }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}

              {days.map((day) => {
                const dayCustomers = customersOnDay(day)
                const hasCustomers = dayCustomers.length > 0
                const isSelected = selectedDay ? isSameDay(day, selectedDay) : false
                const todayDay = isToday(day)

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(isSameDay(day, selectedDay ?? new Date(0)) ? null : day)}
                    className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all ${
                      isSelected
                        ? 'bg-blue-700 text-white ring-2 ring-blue-400'
                        : todayDay
                        ? 'bg-amber-900/40 text-amber-300 ring-1 ring-amber-600/50'
                        : hasCustomers
                        ? 'bg-slate-700 text-white hover:bg-slate-600'
                        : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <span className="font-medium">{format(day, 'd')}</span>
                    {hasCustomers && (
                      <div className="flex gap-0.5 mt-0.5">
                        {Array.from({ length: Math.min(dayCustomers.length, 3) }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 h-1 rounded-full ${isSelected ? 'bg-blue-200' : 'bg-blue-400'}`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Com atendimento</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-amber-900/40 ring-1 ring-amber-600/50" />
                <span>Hoje</span>
              </div>
            </div>
          </div>

          {/* Side panel */}
          <div className="card">
            {selectedDay ? (
              <>
                <h3 className="font-semibold text-white mb-4 capitalize">
                  {format(selectedDay, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </h3>
                {selectedCustomers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500 text-sm">Nenhum atendimento neste dia</p>
                    <Link
                      href={`/customers/new`}
                      className="text-blue-400 hover:text-blue-300 text-sm underline mt-2 block"
                    >
                      Agendar atendimento
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedCustomers.map((c) => (
                      <Link
                        key={c.id}
                        href={`/customers/${c.id}`}
                        className="block p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        <p className="text-white font-medium text-sm">{c.name}</p>
                        {c.phone && <p className="text-slate-400 text-xs mt-0.5">📱 {c.phone}</p>}
                        <span className={`text-xs mt-1 inline-block ${c.status === 'purchased' ? 'badge-purchased' : 'badge-interested'}`}>
                          {c.status === 'purchased' ? 'Comprou' : 'Interessado'}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">📅</p>
                <p className="text-slate-400 text-sm">Clique em um dia para ver os atendimentos</p>
              </div>
            )}

            {/* Summary */}
            <div className="mt-6 pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">
                {format(currentMonth, "MMMM", { locale: ptBR })}
              </p>
              <p className="text-2xl font-bold text-white">
                {customers.filter((c) => {
                  if (!c.service_date) return false
                  const d = parseISO(c.service_date)
                  return d >= monthStart && d <= monthEnd
                }).length}
              </p>
              <p className="text-slate-400 text-sm">atendimentos no mês</p>
            </div>
          </div>
        </div>
      )}

      {/* Import modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">📲 Importar da Agenda</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-400 text-sm mb-5">
              Você pode importar contatos e agendamentos de:
            </p>

            <div className="space-y-3">
              <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📆</span>
                  <p className="font-semibold text-white">Google Agenda</p>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Acesse <strong className="text-slate-300">Google Calendar → Configurações → Exportar</strong> e
                  importe o arquivo .ics. Em breve, este app terá integração direta via OAuth.
                </p>
              </div>

              <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📱</span>
                  <p className="font-semibold text-white">Contatos do celular</p>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  No seu celular, exporte os contatos em formato <strong className="text-slate-300">.vcf</strong> e
                  compartilhe com o app. A integração com Android e iOS está prevista para a próxima versão.
                </p>
              </div>

              <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">💡</span>
                  <p className="font-semibold text-white">Por enquanto...</p>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Cadastre seus clientes manualmente clicando em <strong className="text-slate-300">&quot;Novo Cliente&quot;</strong>.
                  Você pode registrar o telefone, e-mail e data de atendimento diretamente no formulário.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowImportModal(false)}
                className="btn-secondary flex-1"
              >
                Fechar
              </button>
              <Link
                href="/customers/new"
                onClick={() => setShowImportModal(false)}
                className="btn-primary flex-1 text-center"
              >
                Novo Cliente
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
